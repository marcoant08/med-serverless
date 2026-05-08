import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { z } from 'zod';
import { createCriarAgendamentoUseCase } from '../../application/container.js';
import { CriarAgendamentoInput } from '../../application/use-cases/criar-agendamento.js';
import { Logger } from '../../infrastructure/logger/logger.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { withLogging } from '../decorators/with-logging.js';
import { withValidation } from '../decorators/with-validation.js';
import { created } from '../helpers/http-response.js';

const agendamentoSchema = z.object({
  agendamento: z
    .object(
      {
        medico_id: z
          .number({ error: 'O campo "agendamento.medico_id" deve ser um número.' })
          .int(),
        paciente: z
          .string()
          .min(1, 'O campo "agendamento.paciente" deve ser uma string não vazia.'),
        data_horario: z
          .string()
          .min(1, 'O campo "agendamento.data_horario" deve ser uma string não vazia.'),
      },
      { error: 'O campo "agendamento" é obrigatório.' },
    )
    .required(),
});

const createAgendamento = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const logger = new Logger(context.awsRequestId);
  const useCase = createCriarAgendamentoUseCase(logger);
  const body = JSON.parse(event.body!) as { agendamento: CriarAgendamentoInput };

  const resultado = useCase.execute(body.agendamento);
  return created(resultado as unknown as Record<string, unknown>);
};

export const handler = withLogging(withErrorHandler(withValidation(agendamentoSchema, createAgendamento)));
