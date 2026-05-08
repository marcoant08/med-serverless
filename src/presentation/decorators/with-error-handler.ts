import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { errorHandler } from '../errors/error-handler.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withErrorHandler(handler: LambdaHandler): LambdaHandler {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event, context);
    } catch (error) {
      return errorHandler.handle(error);
    }
  };
}
