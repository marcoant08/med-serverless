import { z } from 'zod';

export const agendamentoSchema = z.object({
  agendamento: z
    .object(
      {
        medico_id: z
          .number({ error: 'O campo "agendamento.medico_id" deve ser um número.' })
          .int(),
        paciente: z
          .string({ error: 'O campo "agendamento.paciente" é obrigatório.' })
          .min(1, 'O campo "agendamento.paciente" deve ser uma string não vazia.'),
        data_horario: z
          .string({ error: 'O campo "agendamento.data_horario" é obrigatório.' })
          .min(1, 'O campo "agendamento.data_horario" deve ser uma string não vazia.'),
      },
      { error: 'O campo "agendamento" é obrigatório.' },
    )
    .required(),
});
