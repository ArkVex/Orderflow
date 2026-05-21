import { DeliveryRepository } from "./delivery.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { prisma } from "../../config/database";
import { DeliveryStatus } from "../../generated/prisma/client";

export class DeliveryService {
  private repo = new DeliveryRepository();

  async createDeliveryForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: { select: { lat: true, lng: true } },
        deliveryAddress: { select: { lat: true, lng: true } },
      },
    });
    if (!order) throw ApiError.notFound("Order not found");

    return this.repo.createDelivery(
      orderId,
      order.restaurant.lat ?? undefined,
      order.restaurant.lng ?? undefined,
      order.deliveryAddress?.lat ?? undefined,
      order.deliveryAddress?.lng ?? undefined,
    );
  }

  async getDeliveryById(deliveryId: string) {
    const delivery = await this.repo.findById(deliveryId);
    if (!delivery) throw ApiError.notFound("Delivery not found");
    return delivery;
  }

  async getDeliveryByOrder(orderId: string) {
    const delivery = await this.repo.findByOrderId(orderId);
    if (!delivery) throw ApiError.notFound("No delivery found for this order");
    return delivery;
  }

  async assignDriver(deliveryId: string, driverId: string) {
    const delivery = await this.repo.findById(deliveryId);
    if (!delivery) throw ApiError.notFound("Delivery not found");
    if (delivery.status !== "PENDING") {
      throw ApiError.badRequest("Driver already assigned or delivery in progress");
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) throw ApiError.notFound("Driver not found");
    if (!driver.isAvailable) throw ApiError.badRequest("Driver is not available");

    const [updatedDelivery] = await this.repo.assignDriver(deliveryId, driverId);
    return updatedDelivery;
  }

  async updateDeliveryStatus(deliveryId: string, status: DeliveryStatus, driverUserId: string) {
    const delivery = await this.repo.findById(deliveryId);
    if (!delivery) throw ApiError.notFound("Delivery not found");

    // Verify the driver owns this delivery
    if (delivery.driver?.userId !== driverUserId) {
      throw ApiError.forbidden("Not your delivery");
    }

    const validTransitions: Record<string, string[]> = {
      ASSIGNED: ["PICKED_UP"],
      PICKED_UP: ["IN_TRANSIT"],
      IN_TRANSIT: ["DELIVERED", "FAILED"],
    };

    const allowed = validTransitions[delivery.status] || [];
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(`Cannot transition from ${delivery.status} to ${status}`);
    }

    const extra: Record<string, unknown> = {};
    if (status === "PICKED_UP") extra.actualPickupAt = new Date();
    if (status === "DELIVERED") {
      extra.actualDeliveryAt = new Date();
      // Free up the driver
      await prisma.driver.update({ where: { id: delivery.driverId! }, data: { isAvailable: true } });
    }

    return this.repo.updateStatus(deliveryId, status as DeliveryStatus, extra);
  }

  async updateDriverLocation(deliveryId: string, lat: number, lng: number, driverUserId: string) {
    const delivery = await this.repo.findById(deliveryId);
    if (!delivery) throw ApiError.notFound("Delivery not found");
    if (delivery.driver?.userId !== driverUserId) throw ApiError.forbidden();

    const [locationLog] = await this.repo.addLocationLog(deliveryId, lat, lng);
    return locationLog;
  }

  async getAvailableDrivers() {
    return this.repo.getAvailableDrivers();
  }

  async getMyActiveDeliveries(driverUserId: string) {
    const driver = await prisma.driver.findUnique({ where: { userId: driverUserId } });
    if (!driver) throw ApiError.notFound("Driver profile not found");
    return this.repo.getActiveDeliveriesByDriver(driver.id);
  }

  async registerDriver(userId: string, vehicleType?: string, licensePlate?: string) {
    const existing = await prisma.driver.findUnique({ where: { userId } });
    if (existing) throw ApiError.conflict("Driver profile already exists");
    return prisma.driver.create({
      data: { userId, vehicleType, licensePlate },
    });
  }
}
