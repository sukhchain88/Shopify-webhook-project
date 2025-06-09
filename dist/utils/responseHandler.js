"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
class ResponseHandler {
    static formatDuration(startTime) {
        return `${Date.now() - startTime}ms`;
    }
    static success(res, { statusCode = 200, message, data = null, startTime, }) {
        const response = {
            success: true,
            message,
            data,
        };
        if (startTime) {
            response.duration = this.formatDuration(startTime);
        }
        return res.status(statusCode).json(response);
    }
    static error(res, { statusCode = 500, message = "Internal Server Error", error, details = null, startTime, }) {
        // Log the error for debugging
        console.error(`❌ ${message}:`, error);
        const response = {
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
exports.ResponseHandler = ResponseHandler;
