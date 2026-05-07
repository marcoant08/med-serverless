import { APIGatewayProxyEvent, Context } from 'aws-lambda';

jest.mock('../../src/application/container', () => ({
  listarAgendasUseCase: {
    execute: jest.fn(() => ({
      medicos: [
        {
          id: 1,
          nome: 'Dr. João Silva',
          especialidade: 'Cardiologista',
          horarios_disponiveis: ['2026-06-10 09:00'],
        },
      ],
    })),
  },
}));

import { handler } from '../../src/presentation/handlers/get-agendas';

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

describe('GET /agendas handler', () => {
  it('deve retornar 200 com a lista de médicos', async () => {
    const evento = criarEventoMock();
    const resultado = await handler(evento, {} as Context);

    expect(resultado).toBeDefined();
    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.medicos).toHaveLength(1);
    expect(body.medicos[0].nome).toBe('Dr. João Silva');
  });
});
