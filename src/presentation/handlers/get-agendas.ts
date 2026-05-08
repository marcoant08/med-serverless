import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createListarAgendasUseCase } from '../../application/factories/listar-agendas-factory.js';
import { Logger } from '../../infrastructure/logger/logger.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { withLogging } from '../decorators/with-logging.js';
import { ok } from '../helpers/http-response.js';

class GetAgendasHandler {
  @withLogging
  @withErrorHandler
  static async handle(
    _event: APIGatewayProxyEvent,
    context: Context,
  ): Promise<APIGatewayProxyResult> {
    const logger = new Logger(context.awsRequestId);
    const useCase = createListarAgendasUseCase(logger);
    const resultado = useCase.execute();
    return ok(resultado as unknown as Record<string, unknown>);
  }
}

export const handler = GetAgendasHandler.handle.bind(GetAgendasHandler);
