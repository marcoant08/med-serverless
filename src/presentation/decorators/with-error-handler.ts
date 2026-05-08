import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '../../infrastructure/logger/logger.js';
import { ErrorHandler } from '../errors/error-handler.js';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export function withErrorHandler(
  _target: object,
  _key: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const original = descriptor.value as LambdaHandler;

  descriptor.value = async function (event: APIGatewayProxyEvent, context: Context) {
    const logger = new Logger(context.awsRequestId);
    try {
      return await original(event, context);
    } catch (error) {
      return new ErrorHandler(logger).handle(error);
    }
  };

  return descriptor;
}
