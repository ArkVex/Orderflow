import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(res: Response, result: PaginatedResponse<T>): void {
  res.status(200).json({ success: true, ...result });
}

export function sendMessage(res: Response, message: string, statusCode = 200): void {
  const response: ApiResponse = { success: true, message };
  res.status(statusCode).json(response);
}
