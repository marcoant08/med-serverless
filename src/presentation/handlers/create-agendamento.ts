import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { criarAgendamentoUseCase } from '../../application/container.js';
import { CriarAgendamentoInput } from '../../application/use-cases/criar-agendamento.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { withValidation } from '../decorators/with-validation.js';
import { created } from '../helpers/http-response.js';

function validateAgendamentoPayload(body: Record<string, unknown>): string | null {
  const agendamento = body.agendamento as Record<string, unknown> | undefined;

  if (!agendamento || typeof agendamento !== 'object') {
    return 'O campo "agendamento" é obrigatório.';
  }

  if (typeof agendamento.medico_id !== 'number') {
    return 'O campo "agendamento.medico_id" deve ser um número.';
  }

  if (typeof agendamento.paciente !== 'string' || agendamento.paciente.trim() === '') {
    return 'O campo "agendamento.paciente" deve ser uma string não vazia.';
  }

  if (typeof agendamento.data_horario !== 'string' || agendamento.data_horario.trim() === '') {
    return 'O campo "agendamento.data_horario" deve ser uma string não vazia.';
  }

  return null;
}

const createAgendamento = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body!) as { agendamento: CriarAgendamentoInput };

  const resultado = criarAgendamentoUseCase.execute(body.agendamento);
  return created(resultado as unknown as Record<string, unknown>);
};

export const handler = withErrorHandler(
  withValidation([validateAgendamentoPayload], createAgendamento),
);
