import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "../../shared/types";
import { sendSuccess } from "../../shared/utils/response";

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register(req.body);
    sendSuccess(res, result, 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login(req.body);
    sendSuccess(res, result);
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getProfile(req.user!.userId);
    sendSuccess(res, result);
  };
}
