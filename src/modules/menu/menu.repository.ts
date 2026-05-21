import { prisma } from "../../config/database";
import { CreateCategoryInput, UpdateCategoryInput, CreateMenuItemInput, UpdateMenuItemInput } from "./menu.schema";

export class MenuRepository {
  // ─── Categories ─────────────────────────────────────

  async createCategory(restaurantId: string, data: CreateCategoryInput) {
    return prisma.menuCategory.create({
      data: { ...data, restaurantId },
      include: { items: true },
    });
  }

  async findCategoriesByRestaurant(restaurantId: string) {
    return prisma.menuCategory.findMany({
      where: { restaurantId },
      include: { items: { orderBy: { name: "asc" } } },
      orderBy: { displayOrder: "asc" },
    });
  }

  async findCategoryById(id: string) {
    return prisma.menuCategory.findUnique({
      where: { id },
      include: { items: true, restaurant: { select: { ownerId: true } } },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    return prisma.menuCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return prisma.menuCategory.delete({ where: { id } });
  }

  // ─── Menu Items ─────────────────────────────────────

  async createItem(categoryId: string, data: CreateMenuItemInput) {
    return prisma.menuItem.create({ data: { ...data, categoryId } });
  }

  async findItemById(id: string) {
    return prisma.menuItem.findUnique({
      where: { id },
      include: { category: { include: { restaurant: { select: { ownerId: true } } } } },
    });
  }

  async updateItem(id: string, data: UpdateMenuItemInput) {
    return prisma.menuItem.update({ where: { id }, data });
  }

  async deleteItem(id: string) {
    return prisma.menuItem.delete({ where: { id } });
  }
}
