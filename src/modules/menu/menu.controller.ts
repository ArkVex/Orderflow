import { Request, Response } from "express";
import { MenuService } from "./menu.service";
import { AuthenticatedRequest } from "../../shared/types";
import { sendSuccess, sendMessage } from "../../shared/utils/response";
import { param } from "../../shared/utils/params";

export class MenuController {
  private service = new MenuService();

  // ─── Categories ─────────────────────────────────────

  createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.createCategory(param(req, "restaurantId"), req.user!.userId, req.body);
    sendSuccess(res, result, 201);
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getCategoriesByRestaurant(param(req, "restaurantId"));
    sendSuccess(res, result);
  };

  updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.updateCategory(param(req, "categoryId"), req.user!.userId, req.body);
    sendSuccess(res, result);
  };

  deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.service.deleteCategory(param(req, "categoryId"), req.user!.userId);
    sendMessage(res, "Category deleted");
  };

  // ─── Menu Items ─────────────────────────────────────

  createItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.createItem(param(req, "categoryId"), req.user!.userId, req.body);
    sendSuccess(res, result, 201);
  };

  updateItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.updateItem(param(req, "itemId"), req.user!.userId, req.body);
    sendSuccess(res, result);
  };

  deleteItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.service.deleteItem(param(req, "itemId"), req.user!.userId);
    sendMessage(res, "Menu item deleted");
  };
}
