import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../src/presentation/handlers/get-agendas';

const contexto = {} as Context;

function evento(): APIGatewayProxyEvent {
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
  };
}

describe('E2E GET /agendas', () => {
  it('deve retornar 200 com lista de médicos', async () => {
    const resultado = await handler(evento(), contexto);

    expect(resultado.statusCode).toBe(200);

    const body = JSON.parse(resultado.body);
    expect(body.medicos).toBeDefined();
    expect(Array.isArray(body.medicos)).toBe(true);
    expect(body.medicos.length).toBeGreaterThan(0);
  });

  it('deve retornar médicos com os campos id, nome, especialidade e horarios_disponiveis', async () => {
    const resultado = await handler(evento(), contexto);
    const body = JSON.parse(resultado.body);
    const medico = body.medicos[0];

    expect(medico).toHaveProperty('id');
    expect(medico).toHaveProperty('nome');
    expect(medico).toHaveProperty('especialidade');
    expect(medico).toHaveProperty('horarios_disponiveis');
    expect(Array.isArray(medico.horarios_disponiveis)).toBe(true);
  });

  it('deve retornar Content-Type application/json', async () => {
    const resultado = await handler(evento(), contexto);

    expect(resultado.headers?.['Content-Type']).toBe('application/json');
  });

  it('deve excluir horários já agendados da disponibilidade do médico', async () => {
    const { handler: criarHandler } = await import(
      '../../src/presentation/handlers/create-agendamento'
    );

    const slotOcupado = '2026-06-10 09:00';

    await criarHandler(
      {
        httpMethod: 'POST',
        path: '/agendamento',
        body: JSON.stringify({
          agendamento: { medico_id: 1, paciente: 'Paciente Teste', data_horario: slotOcupado },
        }),
        headers: {},
        multiValueHeaders: {},
        isBase64Encoded: false,
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as APIGatewayProxyEvent['requestContext'],
        resource: '',
      } as APIGatewayProxyEvent,
      contexto,
    );

    const resultado = await handler(evento(), contexto);
    const body = JSON.parse(resultado.body);
    const medicoId1 = body.medicos.find((m: { id: number }) => m.id === 1);

    expect(medicoId1.horarios_disponiveis).not.toContain(slotOcupado);
  });
});
