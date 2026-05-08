import { BusinessError } from './business-error.js';
import { ErrorCode } from './error-codes.js';

export class HorarioIndisponivelError extends BusinessError {
  readonly statusCode = 409;
  readonly erro = 'Horário indisponível';
  readonly code = ErrorCode.HorarioIndisponivel;

  constructor() {
    super('O horário solicitado não está mais disponível para este médico.');
  }
}
