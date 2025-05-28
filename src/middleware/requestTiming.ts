import { Request, Response, NextFunction } from "express";

export const requestTiming = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Add timing to response object
  res.locals.startTime = startTime;

  // Log timing on response finish
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const method = req.method;
    const path = req.originalUrl;
    const status = res.statusCode;
    
    // Only log if status is not 200/201 or if it's a webhook request
    if (status >= 400 || path.includes('/api/webhooks')) {
      console.log(
        `📡 ${method} ${path} - Status: ${status} - ${duration}ms${
          req.get('x-shopify-topic') ? 
          `\n   Topic: ${req.get('x-shopify-topic')}` : 
          ''
        }`
      );
    }
  });

  next();
};
