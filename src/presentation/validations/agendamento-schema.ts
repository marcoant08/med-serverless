import { z } from 'zod';

export const agendamentoSchema = z.object({
  agendamento: z
    .object(
      {
        medico_id: z
          .number({
            error: (issue) =>
              issue.input === undefined
                ? 'O campo "agendamento.medico_id" é obrigatório.'
                : 'O campo "agendamento.medico_id" deve ser um número.',
          })
          .int('O campo "agendamento.medico_id" deve ser um número inteiro.'),
        paciente: z
          .string({
            error: (issue) =>
              issue.input === undefined
                ? 'O campo "agendamento.paciente" é obrigatório.'
                : 'O campo "agendamento.paciente" deve ser uma string.',
          })
          .min(1, 'O campo "agendamento.paciente" deve ser uma string não vazia.'),
        data_horario: z
          .string({
            error: (issue) =>
              issue.input === undefined
                ? 'O campo "agendamento.data_horario" é obrigatório.'
                : 'O campo "agendamento.data_horario" deve ser uma string.',
          })
          .regex(
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
            'O campo "agendamento.data_horario" deve estar no formato "AAAA-MM-DD HH:MM" (ex.: "2026-06-11 16:00").',
          )
          .refine(
            (value) => !isNaN(Date.parse(value)),
            'O campo "agendamento.data_horario" deve ser uma data válida.',
          ),
      },
      { error: 'O campo "agendamento" é obrigatório.' },
    )
    .required(),
});
