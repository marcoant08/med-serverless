import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../src/presentation/handlers/create-agendamento';

const contexto = {} as Context;

function evento(body: Record<string, unknown> | null, rawBody?: string): APIGatewayProxyEvent {
  return {
    httpMethod: 'POST',
    path: '/agendamento',
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

describe('E2E POST /agendamento', () => {
  it('deve criar agendamento com sucesso e retornar 201', async () => {
    const resultado = await handler(
      evento({
        agendamento: { medico_id: 1, paciente: 'Ana Lima', data_horario: '2026-06-10 10:00' },
      }),
      contexto,
    );

    expect(resultado.statusCode).toBe(201);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toBe('Agendamento realizado com sucesso');
    expect(body.agendamento.medico_id).toBe(1);
    expect(body.agendamento.data_horario).toBe('2026-06-10 10:00');
    expect(body.agendamento.id).toBeDefined();
  });

  it('deve retornar 201 com dados completos do agendamento', async () => {
    const resultado = await handler(
      evento({
        agendamento: { medico_id: 2, paciente: 'Bruno Costa', data_horario: '2026-06-11 14:00' },
      }),
      contexto,
    );

    expect(resultado.statusCode).toBe(201);

    const body = JSON.parse(resultado.body);
    expect(body.agendamento).toMatchObject({
      medico_id: 2,
      paciente: 'Bruno Costa',
      data_horario: '2026-06-11 14:00',
    });
    expect(body.agendamento.medico).toBeDefined();
    expect(typeof body.agendamento.id).toBe('string');
  });

  it('deve retornar 409 quando o mesmo horário é agendado duas vezes', async () => {
    const slot = '2026-06-10 11:00';

    const primeiro = await handler(
      evento({ agendamento: { medico_id: 1, paciente: 'Paciente A', data_horario: slot } }),
      contexto,
    );
    expect(primeiro.statusCode).toBe(201);

    const segundo = await handler(
      evento({ agendamento: { medico_id: 1, paciente: 'Paciente B', data_horario: slot } }),
      contexto,
    );
    expect(segundo.statusCode).toBe(409);

    const body = JSON.parse(segundo.body);
    expect(body.erro).toBe('Horário indisponível');
    expect(body.code).toBe('1003');
  });

  it('deve retornar 404 quando médico não existe', async () => {
    const resultado = await handler(
      evento({
        agendamento: { medico_id: 999, paciente: 'Carlos', data_horario: '2026-06-10 09:00' },
      }),
      contexto,
    );

    expect(resultado.statusCode).toBe(404);

    const body = JSON.parse(resultado.body);
    expect(body.erro).toBe('Não encontrado');
    expect(body.code).toBe('1002');
  });

  it('deve retornar 400 quando horário não pertence à agenda do médico', async () => {
    const resultado = await handler(
      evento({
        agendamento: { medico_id: 1, paciente: 'Carlos', data_horario: '2026-07-01 08:00' },
      }),
      contexto,
    );

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.erro).toBe('Payload inválido');
    expect(body.code).toBe('1001');
  });

  it('deve retornar 400 quando body está ausente', async () => {
    const resultado = await handler(evento(null), contexto);

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.code).toBe('1001');
    expect(body.erro).toBe('Payload inválido');
  });

  it('deve retornar 400 quando body não é JSON válido', async () => {
    const resultado = await handler(evento(null, 'nao-e-json'), contexto);

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toBe('O corpo da requisição deve ser um JSON válido.');
  });

  it('deve retornar 400 quando medico_id está ausente', async () => {
    const resultado = await handler(
      evento({ agendamento: { paciente: 'Carlos', data_horario: '2026-06-10 09:00' } }),
      contexto,
    );

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toBe('O campo "agendamento.medico_id" é obrigatório.');
  });

  it('deve retornar 400 quando paciente está ausente', async () => {
    const resultado = await handler(
      evento({ agendamento: { medico_id: 1, data_horario: '2026-06-10 09:00' } }),
      contexto,
    );

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toBe('O campo "agendamento.paciente" é obrigatório.');
  });

  it('deve retornar 400 quando data_horario está ausente', async () => {
    const resultado = await handler(
      evento({ agendamento: { medico_id: 1, paciente: 'Carlos' } }),
      contexto,
    );

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toBe('O campo "agendamento.data_horario" é obrigatório.');
  });

  it('deve retornar 400 quando data_horario tem formato inválido', async () => {
    const resultado = await handler(
      evento({
        agendamento: { medico_id: 1, paciente: 'Carlos', data_horario: '10/06/2026 09:00' },
      }),
      contexto,
    );

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toContain('formato');
  });

  it('deve retornar 400 quando medico_id é do tipo errado', async () => {
    const resultado = await handler(
      evento({
        agendamento: { medico_id: 'abc', paciente: 'Carlos', data_horario: '2026-06-10 09:00' },
      }),
      contexto,
    );

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toContain('medico_id');
  });

  it('deve retornar 400 quando campo agendamento está ausente', async () => {
    const resultado = await handler(evento({ outro: 'campo' }), contexto);

    expect(resultado.statusCode).toBe(400);

    const body = JSON.parse(resultado.body);
    expect(body.mensagem).toContain('agendamento');
  });
});
