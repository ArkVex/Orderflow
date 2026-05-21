import { RestaurantRepository } from "./restaurant.repository";
import { CreateRestaurantInput, UpdateRestaurantInput } from "./restaurant.schema";
import { ApiError } from "../../shared/utils/ApiError";
import { parsePagination, buildPaginationMeta } from "../../shared/utils/pagination";

export class RestaurantService {
  private repo = new RestaurantRepository();

  async create(ownerId: string, data: CreateRestaurantInput) {
    const existing = await this.repo.findByOwnerId(ownerId);
    if (existing) {
      throw ApiError.conflict("You already own a restaurant");
    }
    return this.repo.create(ownerId, data);
  }

  async getById(id: string) {
    const restaurant = await this.repo.findById(id);
    if (!restaurant) throw ApiError.notFound("Restaurant not found");
    return restaurant;
  }

  async list(query: Record<string, unknown>) {
    const pagination = parsePagination(query);
    const { data, total } = await this.repo.findMany(
      { city: query.city as string, isActive: true },
      (pagination.page - 1) * pagination.limit,
      pagination.limit,
      { [pagination.sortBy]: pagination.sortOrder },
    );
    return { data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async update(restaurantId: string, ownerId: string, data: UpdateRestaurantInput) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw ApiError.notFound("Restaurant not found");
    if (restaurant.ownerId !== ownerId) throw ApiError.forbidden("Not your restaurant");
    return this.repo.update(restaurantId, data);
  }

  async delete(restaurantId: string, ownerId: string) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw ApiError.notFound("Restaurant not found");
    if (restaurant.ownerId !== ownerId) throw ApiError.forbidden("Not your restaurant");
    await this.repo.delete(restaurantId);
  }
}
