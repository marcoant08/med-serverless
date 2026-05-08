import { APIGatewayProxyResult } from 'aws-lambda';
import { BusinessError } from '../../domain/errors/business-error.js';
import { Logger } from '../../infrastructure/logger/logger.js';
import { errorResponse } from '../helpers/http-response.js';

export class ErrorHandler {
  constructor(private readonly logger: Logger) {}

  handle(error: unknown): APIGatewayProxyResult {
    if (error instanceof BusinessError) {
      // NUNCA loga error.message — pode conter dados pessoais (nome do paciente, nome do médico)
      this.logger.warn('erro de negocio', {
        tipo: error.constructor.name,
        statusCode: error.statusCode,
      });
      return errorResponse(error.statusCode, error.erro, error.message);
    }

    this.logger.error('erro inesperado', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return errorResponse(500, 'Erro interno', 'Ocorreu um erro inesperado no servidor.');
  }
}
