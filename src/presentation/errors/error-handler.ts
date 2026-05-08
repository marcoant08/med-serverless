import { APIGatewayProxyResult } from 'aws-lambda';
import { BusinessError } from '../../domain/errors/business-error.js';
import { errorResponse } from '../helpers/http-response.js';

export class ErrorHandler {
  handle(error: unknown): APIGatewayProxyResult {
    if (error instanceof BusinessError) {
      return errorResponse(error.statusCode, error.erro, error.message);
    }

    console.error('Erro inesperado:', error);
    return errorResponse(500, 'Erro interno', 'Ocorreu um erro inesperado no servidor.');
  }
}

export const errorHandler = new ErrorHandler();
