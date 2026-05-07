import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import Joi from 'joi';
import { criarAgendamentoUseCase } from '../../application/container.js';
import { CriarAgendamentoInput } from '../../application/use-cases/criar-agendamento.js';
import { withErrorHandler } from '../decorators/with-error-handler.js';
import { withValidation } from '../decorators/with-validation.js';
import { created } from '../helpers/http-response.js';

const agendamentoSchema = Joi.object({
  agendamento: Joi.object({
    medico_id: Joi.number().integer().required().messages({
      'any.required': 'O campo "agendamento.medico_id" é obrigatório.',
      'number.base': 'O campo "agendamento.medico_id" deve ser um número.',
    }),
    paciente: Joi.string().trim().min(1).required().messages({
      'any.required': 'O campo "agendamento.paciente" é obrigatório.',
      'string.empty': 'O campo "agendamento.paciente" deve ser uma string não vazia.',
      'string.base': 'O campo "agendamento.paciente" deve ser uma string não vazia.',
    }),
    data_horario: Joi.string().trim().min(1).required().messages({
      'any.required': 'O campo "agendamento.data_horario" é obrigatório.',
      'string.empty': 'O campo "agendamento.data_horario" deve ser uma string não vazia.',
      'string.base': 'O campo "agendamento.data_horario" deve ser uma string não vazia.',
    }),
  })
    .required()
    .messages({
      'any.required': 'O campo "agendamento" é obrigatório.',
      'object.base': 'O campo "agendamento" é obrigatório.',
    }),
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
