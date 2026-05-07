import { BusinessError } from './business-error.js';

export class ValidationError extends BusinessError {
  readonly statusCode = 400;
  readonly erro = 'Payload inválido';

  constructor(message: string) {
    super(message);
  }
}
