import { Response } from "express";
import { OrderService } from "./order.service";
import { AuthenticatedRequest } from "../../shared/types";
import { sendSuccess, sendPaginated } from "../../shared/utils/response";
import { param } from "../../shared/utils/params";

export class OrderController {
  private service = new OrderService();

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.createOrder(req.user!.userId, req.body);
    sendSuccess(res, result, 201);
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getOrderById(param(req, "id"), req.user!.userId, req.user!.role);
    sendSuccess(res, result);
  };

  getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getMyOrders(req.user!.userId, req.query as Record<string, unknown>);
    sendPaginated(res, result);
  };

  getRestaurantOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getRestaurantOrders(req.user!.userId, req.query as Record<string, unknown>);
    sendPaginated(res, result);
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.updateOrderStatus(
      param(req, "id"), req.body.status, req.user!.userId, req.user!.role,
    );
    sendSuccess(res, result);
  };

  getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getRestaurantStats(req.user!.userId, req.query as Record<string, unknown>);
    sendSuccess(res, result);
  };
}
