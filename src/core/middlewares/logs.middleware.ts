import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
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
      console.log('[QUERY] : ', query);
      console.log('[BODY] : ', body);
      console.log('[IP] : ', ip);
      console.log('[URL] : ', decodeURIComponent(url));
      console.log('[AUTHORIZATION] : ', headers.authorization);
      const message = `${method}: ${decodeURIComponent(
        originalUrl,
      )}  -  ${statusCode} ${statusMessage}`;

      if (statusCode >= 500) {
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        return this.logger.warn(message);
      }

      return this.logger.log(message);
    });

    next();
  }
}
