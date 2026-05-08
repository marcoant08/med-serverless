import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createCriarAgendamentoUseCase } from '../../application/container.js';
import { CriarAgendamentoInput } from '../../application/use-cases/criar-agendamento.js';
import { Logger } from '../../infrastructure/logger/logger.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { withLogging } from '../decorators/with-logging.js';
import { withValidation } from '../decorators/with-validation.js';
import { created } from '../helpers/http-response.js';
import { agendamentoSchema } from '../validations/agendamento-schema.js';

class CreateAgendamentoHandler {
  @withLogging
  @withErrorHandler
  @withValidation(agendamentoSchema)
  static async handle(
    event: APIGatewayProxyEvent,
    context: Context,
  ): Promise<APIGatewayProxyResult> {
    const logger = new Logger(context.awsRequestId);
    const useCase = createCriarAgendamentoUseCase(logger);
    const body = JSON.parse(event.body!) as { agendamento: CriarAgendamentoInput };
    const resultado = useCase.execute(body.agendamento);
    return created(resultado as unknown as Record<string, unknown>);
  }
}

export const handler = CreateAgendamentoHandler.handle.bind(CreateAgendamentoHandler);
