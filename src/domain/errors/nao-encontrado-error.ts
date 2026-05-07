import { BusinessError } from './business-error.js';

export class NaoEncontradoError extends BusinessError {
  readonly statusCode = 404;
  readonly erro = 'Não encontrado';

  constructor(message: string) {
    super(message);
  }
}
