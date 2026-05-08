import { createListarAgendasUseCase } from '../../application/container.js';
import { Logger } from '../../infrastructure/logger/logger.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { withLogging } from '../decorators/with-logging.js';
import { ok } from '../helpers/http-response.js';

export const handler = withLogging(
  withErrorHandler(async (_event, context) => {
    const logger = new Logger(context.awsRequestId);
    const useCase = createListarAgendasUseCase(logger);
    const resultado = useCase.execute();
    return ok(resultado as unknown as Record<string, unknown>);
  }),
);
