import { BusinessError } from './business-error.js';
import { ErrorCode } from './error-codes.js';

export class ServicoIaIndisponivelError extends BusinessError {
  readonly statusCode = 503;
  readonly erro = 'Serviço de IA indisponível';
  readonly code = ErrorCode.ServicoIaIndisponivel;

  constructor(detalhe?: string) {
    super(detalhe ?? 'O serviço de inteligência artificial está temporariamente indisponível.');
  }
}
