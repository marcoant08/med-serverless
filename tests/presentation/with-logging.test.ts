import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { withLogging } from '../../src/presentation/decorators/with-logging';
import { LogEntry } from '../../src/infrastructure/logger/logger';

function criarEventoMock(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    httpMethod: 'GET',
    path: '/agendas',
    body: null,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
    ...overrides,
  };
}

function criarContextoMock(requestId = 'req-teste'): Context {
  return { awsRequestId: requestId } as Context;
}

describe('withLogging', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function entradasLogadas(): LogEntry[] {
    return consoleSpy.mock.calls.map((c) => JSON.parse(c[0]) as LogEntry);
  }

  it('deve emitir log de request recebida com method e path', async () => {
    const innerHandler = jest.fn(async (): Promise<APIGatewayProxyResult> => ({
      statusCode: 200,
      body: '{}',
      headers: {},
    }));

    const handler = withLogging(innerHandler);
    await handler(criarEventoMock({ httpMethod: 'GET', path: '/agendas' }), criarContextoMock());

    const entradas = entradasLogadas();
    const logRecebida = entradas.find((e) => e.message === 'request recebida');
    expect(logRecebida).toBeDefined();
    expect(logRecebida?.context?.method).toBe('GET');
    expect(logRecebida?.context?.path).toBe('/agendas');
  });

  it('deve emitir log de request concluida com statusCode e durationMs', async () => {
    const innerHandler = jest.fn(async (): Promise<APIGatewayProxyResult> => ({
      statusCode: 201,
      body: '{}',
      headers: {},
    }));

    const handler = withLogging(innerHandler);
    await handler(criarEventoMock({ httpMethod: 'POST', path: '/agendamento' }), criarContextoMock());

    const entradas = entradasLogadas();
    const logConcluida = entradas.find((e) => e.message === 'request concluida');
    expect(logConcluida).toBeDefined();
    expect(logConcluida?.context?.statusCode).toBe(201);
    expect(typeof logConcluida?.context?.durationMs).toBe('number');
  });

  it('deve usar o awsRequestId como requestId em todos os logs', async () => {
    const innerHandler = jest.fn(async (): Promise<APIGatewayProxyResult> => ({
      statusCode: 200,
      body: '{}',
      headers: {},
    }));

    const handler = withLogging(innerHandler);
    await handler(criarEventoMock(), criarContextoMock('meu-tracer-id'));

    const entradas = entradasLogadas();
    entradas.forEach((e) => expect(e.requestId).toBe('meu-tracer-id'));
  });

  it('não deve logar nenhum dado do body da requisição', async () => {
    const innerHandler = jest.fn(async (): Promise<APIGatewayProxyResult> => ({
      statusCode: 201,
      body: '{}',
      headers: {},
    }));

    const handler = withLogging(innerHandler);
    await handler(
      criarEventoMock({ body: JSON.stringify({ agendamento: { paciente: 'Carlos Almeida' } }) }),
      criarContextoMock(),
    );

    const saida = consoleSpy.mock.calls.map((c) => c[0]).join(' ');
    expect(saida).not.toContain('Carlos Almeida');
    expect(saida).not.toContain('paciente');
  });

  it('deve retornar a resposta original do handler', async () => {
    const respostaEsperada: APIGatewayProxyResult = { statusCode: 200, body: '{"ok":true}', headers: {} };
    const innerHandler = jest.fn(async () => respostaEsperada);

    const handler = withLogging(innerHandler);
    const resultado = await handler(criarEventoMock(), criarContextoMock());

    expect(resultado).toEqual(respostaEsperada);
  });
});
