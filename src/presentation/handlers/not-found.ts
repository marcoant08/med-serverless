import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse } from '../helpers/http-response.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return errorResponse(
    404,
    'Rota não encontrada',
    `A rota ${event.httpMethod} ${event.path} não existe.`,
  );
};
