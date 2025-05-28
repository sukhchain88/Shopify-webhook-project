import { Response } from "express";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  details?: any;
  duration?: string;
}

export class ResponseHandler {
  private static formatDuration(startTime: number): string {
    return `${Date.now() - startTime}ms`;
  }

  static success(
    res: Response,
    {
      statusCode = 200,
      message,
      data = null,
      startTime,
    }: {
      statusCode?: number;
      message: string;
      data?: any;
      startTime?: number;
    }
  ): Response {
    const response: ApiResponse = {
      success: true,
      message,
      data,
    };

    if (startTime) {
      response.duration = this.formatDuration(startTime);
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    {
      statusCode = 500,
      message = "Internal Server Error",
      error,
      details = null,
      startTime,
    }: {
      statusCode?: number;
      message?: string;
      error?: Error | any;
      details?: any;
      startTime?: number;
    }
  ): Response {
    // Log the error for debugging
    console.error(`❌ ${message}:`, error);

    const response: ApiResponse = {
      success: false,
      message,
      error: error instanceof Error ? error.message : String(error),
      details,
    };

    if (startTime) {
      response.duration = this.formatDuration(startTime);
    }

    return res.status(statusCode).json(response);
  }
} 