import request from 'supertest';
import { createApp } from './helpers/app';

const app = createApp();

describe('E2E GET /agendas', () => {
  it('deve retornar 200 com lista de médicos', async () => {
    const res = await request(app).get('/agendas');

    expect(res.status).toBe(200);
    expect(res.body.medicos).toBeDefined();
    expect(Array.isArray(res.body.medicos)).toBe(true);
    expect(res.body.medicos.length).toBeGreaterThan(0);
  });

  it('deve retornar médicos com os campos id, nome, especialidade e horarios_disponiveis', async () => {
    const res = await request(app).get('/agendas');
    const medico = res.body.medicos[0];

    expect(medico).toHaveProperty('id');
    expect(medico).toHaveProperty('nome');
    expect(medico).toHaveProperty('especialidade');
    expect(medico).toHaveProperty('horarios_disponiveis');
    expect(Array.isArray(medico.horarios_disponiveis)).toBe(true);
  });

  it('deve retornar Content-Type application/json', async () => {
    const res = await request(app).get('/agendas');

    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('deve excluir horários já agendados da disponibilidade do médico', async () => {
    const slotOcupado = '2026-06-10 09:00';

    await request(app)
      .post('/agendamento')
      .send({ agendamento: { medico_id: 1, paciente: 'Paciente Teste', data_horario: slotOcupado } })
      .expect(201);

    const res = await request(app).get('/agendas');
    const medicoId1 = res.body.medicos.find((m: { id: number }) => m.id === 1);

    expect(medicoId1.horarios_disponiveis).not.toContain(slotOcupado);
  });
});
