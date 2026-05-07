import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import Joi from 'joi';
import { ValidationError } from '../../domain/errors/validation-error.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withValidation(schema: Joi.ObjectSchema, handler: LambdaHandler): LambdaHandler {
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

    const { error } = schema.validate(parsed, { abortEarly: false, convert: false });

    if (error) {
      const mensagem = error.details.map((d) => d.message).join('; ');
      throw new ValidationError(mensagem);
    }

    return handler(event, context);
  };
}
