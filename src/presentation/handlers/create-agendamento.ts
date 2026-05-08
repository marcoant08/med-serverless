import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { z } from 'zod';
import { criarAgendamentoUseCase } from '../../application/container.js';
import { CriarAgendamentoInput } from '../../application/use-cases/criar-agendamento.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
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
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body!) as { agendamento: CriarAgendamentoInput };

  const resultado = criarAgendamentoUseCase.execute(body.agendamento);
  return created(resultado as unknown as Record<string, unknown>);
};

export const handler = withErrorHandler(withValidation(agendamentoSchema, createAgendamento));
