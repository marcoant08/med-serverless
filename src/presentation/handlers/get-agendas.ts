import { listarAgendasUseCase } from '../../application/container.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { ok } from '../helpers/http-response.js';

export const handler = withErrorHandler(async () => {
  const resultado = listarAgendasUseCase.execute();
  return ok(resultado as unknown as Record<string, unknown>);
});
