import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/Apiresponse";
import { logger } from "../utils/logger";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error: ApiError;

    if (err instanceof ApiError) {
        error = err;
    } else {
        const message = err instanceof Error ? err.message : "Something went wrong";
        error = new ApiError(500, message);
    }

    const statusCode = error.statusCode || 500;

    logger.error(
        {
            err: error,
            statusCode,
            path: req.path,
            method: req.method,
        },
        "Unhandled error"
    );

    const response = new ApiResponse(statusCode, null, error.message);

    return res.status(statusCode).json(response);
};
