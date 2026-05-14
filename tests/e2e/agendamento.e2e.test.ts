import request from 'supertest';
import { createApp } from './helpers/app';

const app = createApp();

describe('E2E POST /agendamento', () => {
  it('deve criar agendamento com sucesso e retornar 201', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, paciente: 'Ana Lima', data_horario: '2026-06-10 10:00' } });

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe('Agendamento realizado com sucesso');
    expect(res.body.agendamento.medico_id).toBe(1);
    expect(res.body.agendamento.data_horario).toBe('2026-06-10 10:00');
    expect(res.body.agendamento.id).toBeDefined();
  });

  it('deve retornar 201 com dados completos do agendamento', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 2, paciente: 'Bruno Costa', data_horario: '2026-06-11 14:00' } });

    expect(res.status).toBe(201);
    expect(res.body.agendamento).toMatchObject({
      medico_id: 2,
      paciente: 'Bruno Costa',
      data_horario: '2026-06-11 14:00',
    });
    expect(res.body.agendamento.medico).toBeDefined();
    expect(typeof res.body.agendamento.id).toBe('string');
  });

  it('deve retornar 409 quando o mesmo horário é agendado duas vezes', async () => {
    const slot = '2026-06-10 11:00';

    const primeiro = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, paciente: 'Paciente A', data_horario: slot } });
    expect(primeiro.status).toBe(201);

    const segundo = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, paciente: 'Paciente B', data_horario: slot } });
    expect(segundo.status).toBe(409);
    expect(segundo.body.erro).toBe('Horário indisponível');
    expect(segundo.body.code).toBe('1003');
  });

  it('deve retornar 404 quando médico não existe', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 999, paciente: 'Carlos', data_horario: '2026-06-10 09:00' } });

    expect(res.status).toBe(404);
    expect(res.body.erro).toBe('Não encontrado');
    expect(res.body.code).toBe('1002');
  });

  it('deve retornar 400 quando horário não pertence à agenda do médico', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, paciente: 'Carlos', data_horario: '2026-07-01 08:00' } });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Payload inválido');
    expect(res.body.code).toBe('1001');
  });

  it('deve retornar 400 quando body está ausente', async () => {
    const res = await request(app).post('/agendamento');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('1001');
    expect(res.body.erro).toBe('Payload inválido');
  });

  it('deve retornar 400 quando body não é JSON válido', async () => {
    const res = await request(app)
      .post('/agendamento')
      .set('Content-Type', 'application/json')
      .send('nao-e-json');

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe('O corpo da requisição deve ser um JSON válido.');
  });

  it('deve retornar 400 quando medico_id está ausente', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { paciente: 'Carlos', data_horario: '2026-06-10 09:00' } });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe('O campo "agendamento.medico_id" é obrigatório.');
  });

  it('deve retornar 400 quando paciente está ausente', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, data_horario: '2026-06-10 09:00' } });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe('O campo "agendamento.paciente" é obrigatório.');
  });

  it('deve retornar 400 quando data_horario está ausente', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, paciente: 'Carlos' } });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe('O campo "agendamento.data_horario" é obrigatório.');
  });

  it('deve retornar 400 quando data_horario tem formato inválido', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, paciente: 'Carlos', data_horario: '10/06/2026 09:00' } });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toContain('formato');
  });

  it('deve retornar 400 quando medico_id é do tipo errado', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 'abc', paciente: 'Carlos', data_horario: '2026-06-10 09:00' } });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toContain('medico_id');
  });

  it('deve retornar 400 quando campo agendamento está ausente', async () => {
    const res = await request(app)
      .post('/agendamento')
      .send({ outro: 'campo' });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toContain('agendamento');
  });
});
