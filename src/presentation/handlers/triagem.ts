import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createTriagemUseCase } from '../../application/factories/triagem-factory.js';
import { Logger } from '../../infrastructure/logger/logger.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { withLogging } from '../decorators/with-logging.js';
import { withValidation } from '../decorators/with-validation.js';
import { ok } from '../helpers/http-response.js';
import { triagemSchema } from '../validations/triagem-schema.js';

class TriagemHandler {
  @withLogging
  @withErrorHandler
  @withValidation(triagemSchema)
  static async handle(
    event: APIGatewayProxyEvent,
    context: Context,
  ): Promise<APIGatewayProxyResult> {
    const logger = new Logger(context.awsRequestId);
    const useCase = createTriagemUseCase(logger);
    const { sintomas } = JSON.parse(event.body!) as { sintomas: string };
    const resultado = await useCase.execute(sintomas);
    return ok(resultado as unknown as Record<string, unknown>);
  }
}

export const handler = TriagemHandler.handle.bind(TriagemHandler);
