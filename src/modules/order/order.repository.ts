import { prisma } from "../../config/database";
import { OrderStatus, Prisma } from "../../generated/prisma/client";

export class OrderRepository {
  async create(data: Prisma.OrderCreateInput) {
    return prisma.order.create({
      data,
      include: {
        items: { include: { menuItem: true } },
        restaurant: { select: { id: true, name: true, phone: true } },
        customer: { select: { id: true, name: true, email: true } },
        deliveryAddress: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        restaurant: { select: { id: true, name: true, phone: true, address: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        delivery: { include: { driver: { include: { user: { select: { name: true, phone: true } } } } } },
        deliveryAddress: true,
      },
    });
  }

  async findByCustomer(customerId: string, skip: number, take: number) {
    const where = { customerId };
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { menuItem: { select: { name: true } } } },
          restaurant: { select: { name: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    return { data, total };
  }

  async findByRestaurant(restaurantId: string, status: OrderStatus | undefined, skip: number, take: number) {
    const where: Prisma.OrderWhereInput = { restaurantId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { menuItem: { select: { name: true, price: true } } } },
          customer: { select: { name: true, phone: true } },
          delivery: true,
        },
      }),
      prisma.order.count({ where }),
    ]);
    return { data, total };
  }

  async updateStatus(id: string, status: OrderStatus, extra?: Partial<{ estimatedReadyAt: Date; actualReadyAt: Date }>) {
    return prisma.order.update({
      where: { id },
      data: { status, ...extra },
      include: {
        items: { include: { menuItem: true } },
        restaurant: { select: { name: true } },
        customer: { select: { name: true, email: true } },
      },
    });
  }

  async getRestaurantStats(restaurantId: string, from: Date, to: Date) {
    const [totalOrders, revenue, statusBreakdown] = await Promise.all([
      prisma.order.count({
        where: { restaurantId, createdAt: { gte: from, lte: to } },
      }),
      prisma.order.aggregate({
        where: { restaurantId, createdAt: { gte: from, lte: to }, status: { not: "CANCELLED" } },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { restaurantId, createdAt: { gte: from, lte: to } },
        _count: true,
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: revenue._sum.total ?? 0,
      avgOrderValue: revenue._avg.total ?? 0,
      statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count })),
    };
  }
}
