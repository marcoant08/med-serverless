import { BusinessError } from './business-error.js';

export class HorarioIndisponivelError extends BusinessError {
  readonly statusCode = 409;
  readonly erro = 'Horário indisponível';

  constructor() {
    super('O horário solicitado não está mais disponível para este médico.');
  }
}
