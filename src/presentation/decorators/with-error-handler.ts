import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '../../infrastructure/logger/logger.js';
import { ErrorHandler } from '../errors/error-handler.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withErrorHandler(handler: LambdaHandler): LambdaHandler {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = new Logger(context.awsRequestId);
    try {
      return await handler(event, context);
    } catch (error) {
      return new ErrorHandler(logger).handle(error);
    }
  };
}
