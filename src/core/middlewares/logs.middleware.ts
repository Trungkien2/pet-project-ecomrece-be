import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const startTime = Date.now();
    
    response.on('finish', () => {
      const {
        method,
        originalUrl,
        query,
        body,
        ip,
        url,
        authInfo,
        params,
        headers,
      } = request;
      const { statusCode, statusMessage } = response;
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Enhanced logging with color coding and more details
      const timestamp = new Date().toISOString();
      const userAgent = headers['user-agent'] || 'Unknown';
      const contentLength = response.getHeader('content-length') || '0';
      
      // Create detailed log message
      const logDetails = {
        timestamp,
        method,
        url: decodeURIComponent(originalUrl),
        statusCode,
        statusMessage,
        duration: `${duration}ms`,
        ip,
        userAgent,
        contentLength,
        query: Object.keys(query).length > 0 ? query : null,
        bodySize: body ? JSON.stringify(body).length : 0,
        hasAuth: !!headers.authorization,
      };

      // Color-coded console output for development
      console.log('\n=== HTTP REQUEST LOG ===');
      console.log(`[${timestamp}] ${method} ${decodeURIComponent(originalUrl)}`);
      console.log(`Status: ${this.getStatusColor(statusCode)}${statusCode} ${statusMessage}\x1b[0m`);
      console.log(`Duration: ${duration}ms`);
      console.log(`IP: ${ip}`);
      console.log(`Content-Length: ${contentLength}`);
      
      if (Object.keys(query).length > 0) {
        console.log(`[QUERY PARAMS]:`, query);
      }
      
      if (body && Object.keys(body).length > 0) {
        // Don't log passwords and sensitive data
        const sanitizedBody = this.sanitizeBody(body);
        console.log(`[BODY]:`, sanitizedBody);
      }
      
      if (headers.authorization) {
        console.log(`[AUTH]: Bearer token present`);
      }
      
      console.log('========================\n');

      // Structured logging for production
      const message = `${method} ${decodeURIComponent(originalUrl)} - ${statusCode} ${statusMessage} - ${duration}ms`;

      // Use appropriate log level based on status code
      if (statusCode >= 500) {
        return this.logger.error(message, JSON.stringify(logDetails));
      }

      if (statusCode >= 400) {
        return this.logger.warn(message, JSON.stringify(logDetails));
      }

      return this.logger.log(message, JSON.stringify(logDetails));
    });

    next();
  }

  private getStatusColor(statusCode: number): string {
    if (statusCode >= 500) return '\x1b[31m'; // Red
    if (statusCode >= 400) return '\x1b[33m'; // Yellow
    if (statusCode >= 300) return '\x1b[36m'; // Cyan
    if (statusCode >= 200) return '\x1b[32m'; // Green
    return '\x1b[37m'; // White
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'secret', 'key'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
}
