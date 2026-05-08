import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ZodSchema } from 'zod';
import { ValidationError } from '../../domain/errors/validation-error.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withValidation(schema: ZodSchema, handler: LambdaHandler): LambdaHandler {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
      throw new ValidationError('O corpo da requisição não pode ser vazio.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(event.body);
    } catch {
      throw new ValidationError('O corpo da requisição deve ser um JSON válido.');
    }

    const result = schema.safeParse(parsed);

    if (!result.success) {
      const mensagem = result.error.issues.map((issue) => issue.message).join('; ');
      throw new ValidationError(mensagem);
    }

    return handler(event, context);
  };
}
