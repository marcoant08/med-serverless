import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const mockExecute = jest.fn();

jest.mock('../../src/application/factories/triagem-factory', () => ({
  createTriagemUseCase: jest.fn(() => ({
    execute: (...args: unknown[]) => mockExecute(...args),
  })),
}));

import { handler } from '../../src/presentation/handlers/triagem';

function criarEventoMock(body: Record<string, unknown> | null, rawBody?: string): APIGatewayProxyEvent {
  return {
    httpMethod: 'POST',
    path: '/triagem',
    body: rawBody !== undefined ? rawBody : body ? JSON.stringify(body) : null,
    headers: { 'Content-Type': 'application/json' },
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

describe('POST /triagem handler', () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it('deve retornar 200 com sugestão de especialidade', async () => {
    mockExecute.mockResolvedValue({
      sugestao: {
        especialidade: 'Cardiologista',
        justificativa: 'Sintomas compatíveis com problemas cardíacos.',
      },
    });

    const evento = criarEventoMock({ sintomas: 'dor no peito e falta de ar ao subir escadas' });
    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.sugestao.especialidade).toBe('Cardiologista');
    expect(body.sugestao.justificativa).toBeDefined();
  });

  it('deve retornar 400 quando sintomas estão ausentes', async () => {
    const evento = criarEventoMock({});
    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.mensagem).toBe('O campo "sintomas" é obrigatório.');
  });

  it('deve retornar 400 quando sintomas têm menos de 10 caracteres', async () => {
    const evento = criarEventoMock({ sintomas: 'febre' });
    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.mensagem).toContain('10 caracteres');
  });

  it('deve retornar 400 quando sintomas são do tipo errado', async () => {
    const evento = criarEventoMock({ sintomas: 123 });
    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.mensagem).toBe('O campo "sintomas" deve ser uma string.');
  });

  it('deve retornar 503 quando serviço de IA está indisponível', async () => {
    const { ServicoIaIndisponivelError } = await import(
      '../../src/domain/errors/servico-ia-indisponivel-error.js'
    );
    mockExecute.mockRejectedValue(new ServicoIaIndisponivelError());

    const evento = criarEventoMock({ sintomas: 'dor de cabeça intensa e persistente' });
    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(503);

    const body = JSON.parse(response.body);
    expect(body.erro).toBe('Serviço de IA indisponível');
    expect(body.code).toBe('2001');
  });

  it('deve retornar 400 quando body é JSON inválido', async () => {
    const evento = criarEventoMock(null, 'nao-e-json');
    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);
  });
});
