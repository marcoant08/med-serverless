import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const mockExecute = jest.fn();

jest.mock('../../src/application/container', () => ({
  criarAgendamentoUseCase: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
}));

import { handler } from '../../src/presentation/handlers/create-agendamento';

function criarEventoMock(body: Record<string, unknown> | null): APIGatewayProxyEvent {
  return {
    httpMethod: 'POST',
    path: '/agendamento',
    body: body ? JSON.stringify(body) : null,
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

describe('POST /agendamento handler', () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it('deve retornar 201 ao criar agendamento com sucesso', async () => {
    mockExecute.mockReturnValue({
      mensagem: 'Agendamento realizado com sucesso',
      agendamento: {
        id: 'uuid-123',
        medico_id: 1,
        medico: 'Dr. João Silva',
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 09:00',
      },
    });

    const evento = criarEventoMock({
      agendamento: {
        medico_id: 1,
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 09:00',
      },
    });

    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(201);

    const body = JSON.parse(response.body);
    expect(body.mensagem).toBe('Agendamento realizado com sucesso');
    expect(body.agendamento.paciente).toBe('Carlos Almeida');
  });

  it('deve retornar 400 quando body está vazio', async () => {
    const evento = criarEventoMock(null);

    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.erro).toBe('Payload inválido');
  });

  it('deve retornar 400 quando campo agendamento está ausente', async () => {
    const evento = criarEventoMock({ outro: 'valor' });

    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.erro).toBe('Payload inválido');
    expect(body.mensagem).toContain('agendamento');
  });

  it('deve retornar 400 quando medico_id não é número', async () => {
    const evento = criarEventoMock({
      agendamento: {
        medico_id: 'abc',
        paciente: 'Carlos',
        data_horario: '2026-06-10 09:00',
      },
    });

    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);
  });

  it('deve retornar 400 quando paciente está vazio', async () => {
    const evento = criarEventoMock({
      agendamento: {
        medico_id: 1,
        paciente: '',
        data_horario: '2026-06-10 09:00',
      },
    });

    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(400);
  });

  it('deve retornar 409 quando horário está indisponível', async () => {
    const { HorarioIndisponivelError } = await import(
      '../../src/domain/errors/horario-indisponivel-error.js'
    );
    mockExecute.mockImplementation(() => {
      throw new HorarioIndisponivelError();
    });

    const evento = criarEventoMock({
      agendamento: {
        medico_id: 1,
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 09:00',
      },
    });

    const resultado = await handler(evento, {} as Context);

    const response = resultado as { statusCode: number; body: string };
    expect(response.statusCode).toBe(409);

    const body = JSON.parse(response.body);
    expect(body.erro).toBe('Horário indisponível');
  });
});
