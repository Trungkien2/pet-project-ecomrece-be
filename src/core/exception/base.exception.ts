import { IException } from '../interface/exception.interface';

export class BaseException extends Error {
  constructor(_options: IException, _type: string) {
    super();
    this.options = Object.assign({}, _options);
    this.options.type = `${_type}_${_options.type}`;
  }

  options: IException;

  toJSON() {
    return this.options;
  }
}
