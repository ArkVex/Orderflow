import { OrderRepository } from "./order.repository";
import { CreateOrderInput } from "./order.schema";
import { validateTransition } from "./order.state-machine";
import { ApiError } from "../../shared/utils/ApiError";
import { prisma } from "../../config/database";
import { OrderStatus, UserRole } from "../../generated/prisma/client";
import { parsePagination, buildPaginationMeta } from "../../shared/utils/pagination";
import { randomBytes } from "crypto";

export class OrderService {
  private repo = new OrderRepository();

  async createOrder(customerId: string, input: CreateOrderInput) {
    // Verify restaurant exists and is active
    const restaurant = await prisma.restaurant.findUnique({ where: { id: input.restaurantId } });
    if (!restaurant || !restaurant.isActive) {
      throw ApiError.badRequest("Restaurant not found or currently inactive");
    }

    // Fetch all menu items and validate
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw ApiError.badRequest("One or more menu items are unavailable");
    }

    // Calculate pricing
    const itemMap = new Map(menuItems.map((mi) => [mi.id, mi]));
    let subtotal = 0;
    const orderItems = input.items.map((item) => {
      const menuItem = itemMap.get(item.menuItemId)!;
      const lineTotal = menuItem.price * item.quantity;
      subtotal += lineTotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes,
      };
    });

    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
    const deliveryFee = input.deliveryAddressId ? 5.99 : 0;
    const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    const orderNumber = `ORD-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;

    const order = await this.repo.create({
      orderNumber,
      subtotal,
      tax,
      deliveryFee,
      total,
      notes: input.notes,
      paymentMethod: input.paymentMethod,
      customer: { connect: { id: customerId } },
      restaurant: { connect: { id: input.restaurantId } },
      ...(input.deliveryAddressId && { deliveryAddress: { connect: { id: input.deliveryAddressId } } }),
      items: { create: orderItems },
      estimatedReadyAt: new Date(Date.now() + restaurant.avgPrepTime * 60 * 1000),
    });

    return order;
  }

  async getOrderById(orderId: string, userId: string, role: UserRole) {
    const order = await this.repo.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    // Access control
    if (role === "CUSTOMER" && order.customerId !== userId) throw ApiError.forbidden();
    if (role === "RESTAURANT_OWNER") {
      const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: userId } });
      if (!restaurant || order.restaurantId !== restaurant.id) throw ApiError.forbidden();
    }

    return order;
  }

  async getMyOrders(customerId: string, query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { data, total } = await this.repo.findByCustomer(
      customerId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit,
    );
    return { data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getRestaurantOrders(ownerId: string, query: Record<string, unknown>) {
    const restaurant = await prisma.restaurant.findUnique({ where: { ownerId } });
    if (!restaurant) throw ApiError.notFound("Restaurant not found");

    const pagination = parsePagination(query);
    const status = query.status as OrderStatus | undefined;

    const { data, total } = await this.repo.findByRestaurant(
      restaurant.id,
      status,
      (pagination.page - 1) * pagination.limit,
      pagination.limit,
    );
    return { data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, userId: string, role: UserRole) {
    const order = await this.repo.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    // Validate state machine transition
    validateTransition(order.status, newStatus, role);

    // Extra data on certain transitions
    const extra: Record<string, Date> = {};
    if (newStatus === "READY") extra.actualReadyAt = new Date();

    const updated = await this.repo.updateStatus(orderId, newStatus, extra);
    return updated;
  }

  async getRestaurantStats(ownerId: string, query: Record<string, unknown>) {
    const restaurant = await prisma.restaurant.findUnique({ where: { ownerId } });
    if (!restaurant) throw ApiError.notFound("Restaurant not found");

    const now = new Date();
    const from = query.from ? new Date(query.from as string) : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = query.to ? new Date(query.to as string) : now;

    return this.repo.getRestaurantStats(restaurant.id, from, to);
  }
}
