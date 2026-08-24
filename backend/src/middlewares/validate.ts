import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure req.body is an object
      const parsedBody = await schema.parseAsync(req.body || {});
      req.body = parsedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return res.status(400).json({
          error: "Validation failed.",
          details: formattedErrors,
        });
      }
      next(error);
    }
  };
};
