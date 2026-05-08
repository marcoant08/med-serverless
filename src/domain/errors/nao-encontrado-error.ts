import { BusinessError } from './business-error.js';
import { ErrorCode } from './error-codes.js';

export class NaoEncontradoError extends BusinessError {
  readonly statusCode = 404;
  readonly erro = 'Não encontrado';
  readonly code = ErrorCode.NaoEncontrado;

  constructor(message: string) {
    super(message);
  }
}
