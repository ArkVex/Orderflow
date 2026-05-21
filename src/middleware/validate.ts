import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiError } from "../shared/utils/ApiError";

type RequestField = "body" | "query" | "params";

export function validate(schema: z.ZodSchema, field: RequestField = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[field]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(", ");
      throw ApiError.badRequest(`Validation error: ${errors}`);
    }
    req[field] = result.data;
    next();
  };
}
