import request from 'supertest';
import { createApp } from './helpers/app';

const app = createApp();

describe('E2E rotas não encontradas', () => {
  it('deve retornar 404 para rota inexistente', async () => {
    const res = await request(app).get('/rota-inexistente');

    expect(res.status).toBe(404);
  });

  it('deve retornar code 1004 e erro "Rota não encontrada"', async () => {
    const res = await request(app).get('/rota-inexistente');

    expect(res.body.code).toBe('1004');
    expect(res.body.erro).toBe('Rota não encontrada');
  });

  it('deve incluir o método HTTP e o path na mensagem', async () => {
    const res = await request(app).delete('/recurso');

    expect(res.body.mensagem).toContain('DELETE');
    expect(res.body.mensagem).toContain('/recurso');
  });

  it('deve retornar Content-Type application/json', async () => {
    const res = await request(app).post('/nao-existe');

    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('deve funcionar para qualquer método HTTP', async () => {
    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const res = await request(app)[method]('/qualquer');
      expect(res.status).toBe(404);
    }
  });
});
