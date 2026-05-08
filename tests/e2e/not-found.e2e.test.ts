import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/presentation/handlers/not-found';

function evento(method: string, path: string): APIGatewayProxyEvent {
  return {
    httpMethod: method,
    path,
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

describe('E2E rotas não encontradas', () => {
  it('deve retornar 404 para rota inexistente', async () => {
    const resultado = await handler(evento('GET', '/rota-inexistente'));

    expect(resultado.statusCode).toBe(404);
  });

  it('deve retornar code 1004 e erro "Rota não encontrada"', async () => {
    const resultado = await handler(evento('GET', '/rota-inexistente'));
    const body = JSON.parse(resultado.body);

    expect(body.code).toBe('1004');
    expect(body.erro).toBe('Rota não encontrada');
  });

  it('deve incluir o método HTTP e o path na mensagem', async () => {
    const resultado = await handler(evento('DELETE', '/recurso'));
    const body = JSON.parse(resultado.body);

    expect(body.mensagem).toContain('DELETE');
    expect(body.mensagem).toContain('/recurso');
  });

  it('deve retornar Content-Type application/json', async () => {
    const resultado = await handler(evento('POST', '/nao-existe'));

    expect(resultado.headers?.['Content-Type']).toBe('application/json');
  });

  it('deve funcionar para qualquer método HTTP', async () => {
    const metodos = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

    for (const metodo of metodos) {
      const resultado = await handler(evento(metodo, '/qualquer'));
      expect(resultado.statusCode).toBe(404);
    }
  });
});
