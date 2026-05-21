import { Request, Response } from "express";
import { RestaurantService } from "./restaurant.service";
import { AuthenticatedRequest } from "../../shared/types";
import { sendSuccess, sendPaginated, sendMessage } from "../../shared/utils/response";
import { param } from "../../shared/utils/params";

export class RestaurantController {
  private service = new RestaurantService();

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.create(req.user!.userId, req.body);
    sendSuccess(res, result, 201);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getById(param(req, "id"));
    sendSuccess(res, result);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.list(req.query as Record<string, unknown>);
    sendPaginated(res, result);
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.update(param(req, "id"), req.user!.userId, req.body);
    sendSuccess(res, result);
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.service.delete(param(req, "id"), req.user!.userId);
    sendMessage(res, "Restaurant deleted successfully");
  };
}
