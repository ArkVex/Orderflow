import { prisma } from "../../config/database";
import { DeliveryStatus } from "../../generated/prisma/client";

export class DeliveryRepository {
  async createDelivery(orderId: string, pickupLat?: number, pickupLng?: number, dropoffLat?: number, dropoffLng?: number) {
    return prisma.delivery.create({
      data: { orderId, pickupLat, pickupLng, dropoffLat, dropoffLng },
      include: { order: { select: { orderNumber: true, restaurant: { select: { name: true } } } } },
    });
  }

  async findById(id: string) {
    return prisma.delivery.findUnique({
      where: { id },
      include: {
        driver: { include: { user: { select: { name: true, phone: true } } } },
        order: {
          select: {
            orderNumber: true,
            customer: { select: { name: true, phone: true } },
            restaurant: { select: { name: true, address: true, phone: true } },
            deliveryAddress: true,
          },
        },
        locationHistory: { orderBy: { timestamp: "desc" }, take: 50 },
      },
    });
  }

  async findByOrderId(orderId: string) {
    return prisma.delivery.findUnique({
      where: { orderId },
      include: {
        driver: { include: { user: { select: { name: true, phone: true } } } },
        locationHistory: { orderBy: { timestamp: "desc" }, take: 10 },
      },
    });
  }

  async assignDriver(deliveryId: string, driverId: string) {
    return prisma.$transaction([
      prisma.delivery.update({
        where: { id: deliveryId },
        data: { driverId, status: DeliveryStatus.ASSIGNED },
      }),
      prisma.driver.update({
        where: { id: driverId },
        data: { isAvailable: false },
      }),
    ]);
  }

  async updateStatus(deliveryId: string, status: DeliveryStatus, extra?: Record<string, unknown>) {
    return prisma.delivery.update({
      where: { id: deliveryId },
      data: { status, ...extra },
    });
  }

  async addLocationLog(deliveryId: string, lat: number, lng: number) {
    return prisma.$transaction([
      prisma.deliveryLocationLog.create({
        data: { deliveryId, lat, lng },
      }),
      prisma.delivery.update({
        where: { id: deliveryId },
        data: { currentLat: lat, currentLng: lng },
      }),
    ]);
  }

  async getAvailableDrivers() {
    return prisma.driver.findMany({
      where: { isAvailable: true },
      include: { user: { select: { name: true, phone: true } } },
    });
  }

  async getActiveDeliveriesByDriver(driverId: string) {
    return prisma.delivery.findMany({
      where: { driverId, status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] } },
      include: {
        order: {
          select: {
            orderNumber: true, total: true,
            customer: { select: { name: true, phone: true } },
            restaurant: { select: { name: true, address: true } },
            deliveryAddress: true,
          },
        },
      },
    });
  }
}
