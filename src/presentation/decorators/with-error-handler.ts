import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { BusinessError } from '../../domain/errors/business-error.js';
import { errorResponse } from '../helpers/http-response.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withErrorHandler(handler: LambdaHandler): LambdaHandler {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event, context);
    } catch (error) {
      if (error instanceof BusinessError) {
        return errorResponse(error.statusCode, error.erro, error.message);
      }

      console.error('Erro inesperado:', error);
      return errorResponse(500, 'Erro interno', 'Ocorreu um erro inesperado no servidor.');
    }
  };
}
