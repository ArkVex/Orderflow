import { MenuRepository } from "./menu.repository";
import { CreateCategoryInput, UpdateCategoryInput, CreateMenuItemInput, UpdateMenuItemInput } from "./menu.schema";
import { ApiError } from "../../shared/utils/ApiError";
import { prisma } from "../../config/database";

export class MenuService {
  private repo = new MenuRepository();

  // ─── Categories ─────────────────────────────────────

  async createCategory(restaurantId: string, ownerId: string, data: CreateCategoryInput) {
    await this.verifyRestaurantOwner(restaurantId, ownerId);
    return this.repo.createCategory(restaurantId, data);
  }

  async getCategoriesByRestaurant(restaurantId: string) {
    return this.repo.findCategoriesByRestaurant(restaurantId);
  }

  async updateCategory(categoryId: string, ownerId: string, data: UpdateCategoryInput) {
    const category = await this.repo.findCategoryById(categoryId);
    if (!category) throw ApiError.notFound("Category not found");
    if (category.restaurant.ownerId !== ownerId) throw ApiError.forbidden();
    return this.repo.updateCategory(categoryId, data);
  }

  async deleteCategory(categoryId: string, ownerId: string) {
    const category = await this.repo.findCategoryById(categoryId);
    if (!category) throw ApiError.notFound("Category not found");
    if (category.restaurant.ownerId !== ownerId) throw ApiError.forbidden();
    await this.repo.deleteCategory(categoryId);
  }

  // ─── Menu Items ─────────────────────────────────────

  async createItem(categoryId: string, ownerId: string, data: CreateMenuItemInput) {
    const category = await this.repo.findCategoryById(categoryId);
    if (!category) throw ApiError.notFound("Category not found");
    if (category.restaurant.ownerId !== ownerId) throw ApiError.forbidden();
    return this.repo.createItem(categoryId, data);
  }

  async updateItem(itemId: string, ownerId: string, data: UpdateMenuItemInput) {
    const item = await this.repo.findItemById(itemId);
    if (!item) throw ApiError.notFound("Menu item not found");
    if (item.category.restaurant.ownerId !== ownerId) throw ApiError.forbidden();
    return this.repo.updateItem(itemId, data);
  }

  async deleteItem(itemId: string, ownerId: string) {
    const item = await this.repo.findItemById(itemId);
    if (!item) throw ApiError.notFound("Menu item not found");
    if (item.category.restaurant.ownerId !== ownerId) throw ApiError.forbidden();
    await this.repo.deleteItem(itemId);
  }

  // ─── Helpers ────────────────────────────────────────

  private async verifyRestaurantOwner(restaurantId: string, ownerId: string) {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw ApiError.notFound("Restaurant not found");
    if (restaurant.ownerId !== ownerId) throw ApiError.forbidden();
  }
}
