/**
 * Global Error Handler Middleware
 *
 * This middleware catches all unhandled errors in the application
 * and returns consistent error responses to the client.
 *
 * @author Your Name
 */
/**
 * Error Handler Middleware
 *
 * @param error - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (error, req, res, next) => {
    // Log the error for debugging
    console.error('❌ Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Default error values
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let details = error.details || null;
    // Handle specific error types
    switch (error.name) {
        case 'ValidationError':
            statusCode = 400;
            message = 'Validation Error';
            details = error.message;
            break;
        case 'SequelizeValidationError':
            statusCode = 400;
            message = 'Database Validation Error';
            details = error.message;
            break;
        case 'SequelizeUniqueConstraintError':
            statusCode = 409;
            message = 'Duplicate Entry';
            details = 'A record with this data already exists';
            break;
        case 'SequelizeForeignKeyConstraintError':
            statusCode = 400;
            message = 'Invalid Reference';
            details = 'Referenced record does not exist';
            break;
        case 'JsonWebTokenError':
            statusCode = 401;
            message = 'Invalid Token';
            details = 'Authentication token is invalid';
            break;
        case 'TokenExpiredError':
            statusCode = 401;
            message = 'Token Expired';
            details = 'Authentication token has expired';
            break;
        case 'CastError':
            statusCode = 400;
            message = 'Invalid ID Format';
            details = 'The provided ID is not in the correct format';
            break;
        default:
            // Handle HTTP status codes
            if (error.code === 'ENOTFOUND') {
                statusCode = 503;
                message = 'Service Unavailable';
                details = 'External service is not reachable';
            }
            else if (error.code === 'ECONNREFUSED') {
                statusCode = 503;
                message = 'Connection Refused';
                details = 'Unable to connect to external service';
            }
            break;
    }
    // Prepare error response
    const errorResponse = {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };
    // Add details in development mode
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = details;
        errorResponse.stack = error.stack;
    }
    else if (details) {
        // Only add safe details in production
        errorResponse.details = details;
    }
    // Send error response
    res.status(statusCode).json(errorResponse);
};
/**
 * Async Error Handler Wrapper
 *
 * Wraps async route handlers to catch errors and pass them to the error handler
 *
 * @param fn - Async function to wrap
 * @returns Wrapped function that catches errors
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * Not Found Handler
 *
 * Creates a 404 error for routes that don't exist
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};
