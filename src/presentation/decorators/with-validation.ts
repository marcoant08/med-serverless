import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ValidationError } from '../../domain/errors/validation-error.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

type ValidationRule = (body: Record<string, unknown>) => string | null;

export function withValidation(rules: ValidationRule[], handler: LambdaHandler): LambdaHandler {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
      throw new ValidationError('O corpo da requisição não pode ser vazio.');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(event.body) as Record<string, unknown>;
    } catch {
      throw new ValidationError('O corpo da requisição deve ser um JSON válido.');
    }

    for (const rule of rules) {
      const errorMessage = rule(parsed);
      if (errorMessage) {
        throw new ValidationError(errorMessage);
      }
    }

    return handler(event, context);
  };
}
