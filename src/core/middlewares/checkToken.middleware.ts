import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CheckTokenMiddleware implements NestMiddleware {
  async use(request: Request, response: Response, next: NextFunction) {
    const jwtService: JwtService = new JwtService();
    //check token old when login again && check concurrent access
    if (request.headers.authorization) {
      const token = request.headers.authorization.slice(7);
      const payload: any = jwtService.decode(token);
      //   const user = await UserEntity.findOne({
      //     where: { id: payload.id },
      //   });

      //   if (user?.access_token != token) {
      //     // next(new AuthException(EXCEPTION.UNAUTHORIZED));
      //   }
    }
    next();
  }
}
