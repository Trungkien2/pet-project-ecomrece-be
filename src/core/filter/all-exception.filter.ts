import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  Logger,
  BadRequestException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseException } from '../exception';
import { EXCEPTION } from '../exception/exception';
import { HttpResponse } from '../respone/http-respone';
import { HostLanguage } from '../contanst/language.enum';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(ex: unknown | any, host: ArgumentsHost) {
    let exception = null;

    try {
      exception = new ex();
    } catch (e) {
      exception = ex;
    }
    this.logger.error(exception);
    console.error(exception);

    const context = host.switchToHttp();
    const response: Response<any> = context
      .getResponse<Response>()
      .header('content-Type', 'application/json');
    const request: Request = context.getRequest<Request>();
    const hl: any = request.query['hl'] || HostLanguage.en;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = exception?.message?.error;

    if (exception instanceof BaseException) {
      const type = exception.options.type;
      const statusCode = exception.options.statusCode;
      message = exception.options.message[hl] || message;
      return response
        .status(status)
        .send(
          Buffer.from(
            JSON.stringify(
              HttpResponse.build<string>()
                .withStatusCode(statusCode)
                .withType(type)
                .withMessage(message)
                .build(),
            ),
          ),
        );
    }

    try {
      const message = EXCEPTION.SORRY_SOMETHING_WENT_WRONG.message[hl];
      const type = EXCEPTION.SORRY_SOMETHING_WENT_WRONG.type;
      const statusCode = EXCEPTION.SORRY_SOMETHING_WENT_WRONG.statusCode;
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
        Buffer.from(
          JSON.stringify(
            HttpResponse.build<string>()
              .withStatusCode(statusCode)
              .withType(exception.name ?? type)
              .withMessage(exception.message ?? message)
              .build(),
          ),
        ),
      );
    } catch (e) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(Buffer.from(JSON.stringify(exception)));
    }
  }
}
