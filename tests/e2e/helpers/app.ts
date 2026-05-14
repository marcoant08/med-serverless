import express, { Request, Response } from 'express';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { handler as getAgendasHandler } from '../../../src/presentation/handlers/get-agendas';
import { handler as createAgendamentoHandler } from '../../../src/presentation/handlers/create-agendamento';
import { handler as notFoundHandler } from '../../../src/presentation/handlers/not-found';

const mockContext: Context = {
  awsRequestId: 'supertest-request-id',
  functionName: 'test',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:000000000000:function:test',
  memoryLimitInMB: '128',
  logGroupName: '/aws/lambda/test',
  logStreamName: '2026/01/01/[$LATEST]test',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
  callbackWaitsForEmptyEventLoop: false,
};

function buildEvent(req: Request): APIGatewayProxyEvent {
  return {
    httpMethod: req.method,
    path: req.path,
    body: typeof req.body === 'string' && req.body.length > 0 ? req.body : null,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
  };
}

function sendLambdaResponse(result: APIGatewayProxyResult, res: Response): void {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, String(value));
    }
  }
  res.status(result.statusCode).send(result.body);
}

export function createApp(): express.Application {
  const app = express();

  // Captura o body como string bruta para repassar intacto ao event.body do Lambda
  app.use(express.text({ type: 'application/json' }));

  app.get('/agendas', async (req, res) => {
    const result = await getAgendasHandler(buildEvent(req), mockContext);
    sendLambdaResponse(result, res);
  });

  app.post('/agendamento', async (req, res) => {
    const result = await createAgendamentoHandler(buildEvent(req), mockContext);
    sendLambdaResponse(result, res);
  });

  // Catch-all: repassa ao handler de rota não encontrada
  app.use(async (req, res) => {
    const result = await notFoundHandler(buildEvent(req));
    sendLambdaResponse(result, res);
  });

  return app;
}
