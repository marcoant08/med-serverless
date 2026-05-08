import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '../../infrastructure/logger/logger.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withLogging(handler: LambdaHandler): LambdaHandler {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = new Logger(context.awsRequestId);
    const start = Date.now();

    logger.info('request recebida', {
      method: event.httpMethod,
      path: event.path,
    });

    const result = await handler(event, context);

    logger.info('request concluida', {
      method: event.httpMethod,
      path: event.path,
      statusCode: result.statusCode,
      durationMs: Date.now() - start,
    });

    return result;
  };
}
