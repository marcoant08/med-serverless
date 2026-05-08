import { BusinessError } from './business-error.js';
import { ErrorCode } from './error-codes.js';

export class ValidationError extends BusinessError {
  readonly statusCode = 400;
  readonly erro = 'Payload inválido';
  readonly code = ErrorCode.PayloadInvalido;

  constructor(message: string) {
    super(message);
  }
}
