import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '../../infrastructure/logger/logger.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withLogging(
  _target: object,
  _key: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const original = descriptor.value as LambdaHandler;

  descriptor.value = async function (event: APIGatewayProxyEvent, context: Context) {
    const logger = new Logger(context.awsRequestId);
    const start = Date.now();

    logger.info('request recebida', {
      method: event.httpMethod,
      path: event.path,
    });

    const result = await original(event, context);

    logger.info('request concluida', {
      method: event.httpMethod,
      path: event.path,
      statusCode: result.statusCode,
      durationMs: Date.now() - start,
    });

    return result;
  };

  return descriptor;
}
