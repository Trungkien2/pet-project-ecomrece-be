// import { StatusCode } from '@common/constants/status-code.enum';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
import { IsObject } from 'class-validator';

export class HttpResponse<T> {
  @ApiProperty({
    // enum: StatusCode,
    // default: StatusCode.OK
  })
  statusCode: number;

  @ApiProperty()
  type: string;

  @ApiProperty({
    //  default: MessageResponse[StatusCode.OK]['en']
  })
  message: string;

  @ApiProperty()
  data: T;

  static build<T>(): HttpResponseBuilder<T> {
    return new HttpResponseBuilder<T>();
  }

  static success<T>(data?: T, type?: string): HttpResponse<T> {
    return this.build<T>().withStatusCode(200).withData(data).build();
  }
}

export class HttpResponseBuilder<T> {
  private statusCode: number;
  private message: string;
  private data: T;
  private type: string;
  withType(type: string): HttpResponseBuilder<T> {
    this.type = type;
    return this;
  }

  withStatusCode(statusCode: number): HttpResponseBuilder<T> {
    this.statusCode = statusCode;
    return this;
  }

  withMessage(message: string): HttpResponseBuilder<T> {
    this.message = message;
    return this;
  }

  withData(data: T): HttpResponseBuilder<T> {
    this.data = data;
    return this;
  }

  build(): HttpResponse<T> {
    const httpResponse = new HttpResponse<T>();
    httpResponse.statusCode = this.statusCode;
    httpResponse.type = this.type;
    httpResponse.message = this.message;
    httpResponse.data = this.data;

    return httpResponse;
  }
}
