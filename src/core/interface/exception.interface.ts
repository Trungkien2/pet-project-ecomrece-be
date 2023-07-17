import { HttpStatus } from '@nestjs/common';

export interface IHLException {
  en: string;
  ko?: string;
  vi?: string;
  [x: string]: any;
}

export interface IException {
  message: IHLException;
  statusCode: number;
  httpCode: HttpStatus;
  type: string;
}
