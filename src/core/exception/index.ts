import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { EXCEPTION } from './exception';
import { IException } from '../interface/exception.interface';
export * from './base.exception';
export class AuthException extends BaseException {
  constructor(exeption: IException = EXCEPTION.UNAUTHORIZED) {
    super(exeption, 'auth_exception');
  }
}

export class RouterException extends BaseException {
  constructor(exeption: IException = EXCEPTION.BAD_REQUEST) {
    super(exeption, 'router_exception');
  }
}

export class DatabaseException extends BaseException {
  constructor(exeption: IException = EXCEPTION.RECORD_NOT_FOUND) {
    super(exeption, 'database_exception');
  }
}

export class FirebaseException extends BaseException {
  constructor(exeption: IException = EXCEPTION.SORRY_SOMETHING_WENT_WRONG) {
    super(exeption, 'firebase_exception');
  }
}
