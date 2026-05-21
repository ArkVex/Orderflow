import { prisma } from "../../config/database";
import { CreateRestaurantInput, UpdateRestaurantInput } from "./restaurant.schema";
import { Prisma } from "../../generated/prisma/client";

export class RestaurantRepository {
  async create(ownerId: string, data: CreateRestaurantInput) {
    return prisma.restaurant.create({
      data: { ...data, ownerId, operatingHours: data.operatingHours ?? Prisma.JsonNull },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async findById(id: string) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        menuCategories: { include: { items: true }, orderBy: { displayOrder: "asc" } },
      },
    });
  }

  async findByOwnerId(ownerId: string) {
    return prisma.restaurant.findUnique({ where: { ownerId } });
  }

  async findMany(filters: { city?: string; isActive?: boolean }, skip: number, take: number, orderBy: Record<string, string>) {
    const where: Prisma.RestaurantWhereInput = {};
    if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [data, total] = await Promise.all([
      prisma.restaurant.findMany({ where, skip, take, orderBy, include: { owner: { select: { id: true, name: true } } } }),
      prisma.restaurant.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateRestaurantInput) {
    return prisma.restaurant.update({
      where: { id },
      data: { ...data, operatingHours: data.operatingHours ?? undefined },
    });
  }

  async delete(id: string) {
    return prisma.restaurant.delete({ where: { id } });
  }
}
