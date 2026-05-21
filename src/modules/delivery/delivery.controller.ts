import { Request, Response } from "express";
import { DeliveryService } from "./delivery.service";
import { AuthenticatedRequest } from "../../shared/types";
import { sendSuccess } from "../../shared/utils/response";
import { param } from "../../shared/utils/params";

export class DeliveryController {
  private service = new DeliveryService();

  createForOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.createDeliveryForOrder(param(req, "orderId"));
    sendSuccess(res, result, 201);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getDeliveryById(param(req, "id"));
    sendSuccess(res, result);
  };

  getByOrder = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getDeliveryByOrder(param(req, "orderId"));
    sendSuccess(res, result);
  };

  assignDriver = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.assignDriver(param(req, "id"), req.body.driverId);
    sendSuccess(res, result);
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.updateDeliveryStatus(param(req, "id"), req.body.status, req.user!.userId);
    sendSuccess(res, result);
  };

  updateLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.updateDriverLocation(param(req, "id"), req.body.lat, req.body.lng, req.user!.userId);
    sendSuccess(res, result);
  };

  getAvailableDrivers = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.service.getAvailableDrivers();
    sendSuccess(res, result);
  };

  getMyDeliveries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getMyActiveDeliveries(req.user!.userId);
    sendSuccess(res, result);
  };

  registerDriver = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.registerDriver(req.user!.userId, req.body.vehicleType, req.body.licensePlate);
    sendSuccess(res, result, 201);
  };
}
