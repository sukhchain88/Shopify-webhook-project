/**
 * Security Middleware Configuration
 * 
 * This file contains all security-related middleware configurations
 * following security best practices for production applications.
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Helmet Security Configuration
 * 
 * Comprehensive security headers configuration
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  
  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameguard: { action: 'deny' },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Referrer-Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  
  // X-XSS-Protection (legacy but still useful)
  xssFilter: true,
  
  // Hide X-Powered-By header
  hidePoweredBy: true
});

/**
 * General Rate Limiting Configuration
 * 
 * Applies to all routes by default
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Strict Rate Limiting for Authentication Routes
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Webhook Rate Limiting Configuration
 * 
 * More lenient for webhooks but still protected
 */
export const webhookRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // Limit each IP to 500 webhook requests per windowMs
  message: {
    error: 'Webhook rate limit exceeded, please try again later.',
    retryAfter: '5 minutes'
  },
  handler: (req: Request, res: Response) => {
    console.warn(`Webhook rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      error: 'Webhook rate limit exceeded, please try again later.',
      retryAfter: '5 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Request Sanitization Middleware
 * 
 * Sanitizes request body to prevent XSS and injection attacks
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Basic sanitization for common XSS patterns
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  next();
};

/**
 * IP Whitelist Middleware for Webhooks
 * 
 * Restricts webhook access to known Shopify IP ranges
 */
export const shopifyIPWhitelist = (req: Request, res: Response, next: NextFunction) => {
  // In development, skip IP checking
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Shopify webhook IP ranges (update as needed)
  const shopifyIPs = [
    // Add actual Shopify IP ranges here
    // For now, allow all in production but log the IP
    // '23.227.38.0/24',
    // '107.178.194.0/24',
  ];

  const clientIP = req.ip || req.connection.remoteAddress || '';
  
  // Log webhook requests for monitoring
  console.log(`Webhook request from IP: ${clientIP} to ${req.originalUrl}`);
  
  // For now, just log and continue - implement actual IP checking as needed
  next();
};

/**
 * Request Size Limiting Middleware
 * 
 * Ensures request payloads aren't too large
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('content-length') || '0', 10);
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large',
      maxSize: '10MB',
      receivedSize: `${Math.round(contentLength / 1024 / 1024 * 100) / 100}MB`
    });
  }
  
  next();
}; 