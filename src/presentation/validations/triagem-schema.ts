import { z } from 'zod';

export const triagemSchema = z.object({
  sintomas: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'O campo "sintomas" é obrigatório.'
          : 'O campo "sintomas" deve ser uma string.',
    })
    .min(10, 'Descreva os sintomas com pelo menos 10 caracteres.'),
});
