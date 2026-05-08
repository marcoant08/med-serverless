import { CriarAgendamentoUseCase } from '../../src/application/use-cases/criar-agendamento';
import { Logger } from '../../src/infrastructure/logger/logger';
import { Medico } from '../../src/domain/entities/medico';
import { IMedicoRepository } from '../../src/domain/repositories/medico-repository';
import { IAgendamentoRepository } from '../../src/domain/repositories/agendamento-repository';
import { HorarioIndisponivelError } from '../../src/domain/errors/horario-indisponivel-error';
import { NaoEncontradoError } from '../../src/domain/errors/nao-encontrado-error';
import { ValidationError } from '../../src/domain/errors/validation-error';

const medicoMock: Medico = {
  id: 1,
  nome: 'Dr. João Silva',
  especialidade: 'Cardiologista',
  horarios_disponiveis: ['2026-06-10 09:00', '2026-06-10 10:00'],
};

function criarLoggerMock(): jest.Mocked<Logger> {
  return { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as unknown as jest.Mocked<Logger>;
}

function criarMedicoRepositoryMock(medico: Medico | undefined): IMedicoRepository {
  return {
    listarTodos: jest.fn(() => (medico ? [medico] : [])),
    buscarPorId: jest.fn(() => medico),
  };
}

function criarAgendamentoRepositoryMock(conflito: boolean): IAgendamentoRepository {
  return {
    criar: jest.fn(),
    existeConflito: jest.fn(() => conflito),
    listarPorMedico: jest.fn(() => []),
  };
}

describe('CriarAgendamentoUseCase', () => {
  it('deve criar um agendamento com sucesso', () => {
    const medicoRepo = criarMedicoRepositoryMock(medicoMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock(false);
    const useCase = new CriarAgendamentoUseCase(medicoRepo, agendamentoRepo, criarLoggerMock());

    const resultado = useCase.execute({
      medico_id: 1,
      paciente: 'Carlos Almeida',
      data_horario: '2026-06-10 09:00',
    });

    expect(resultado.mensagem).toBe('Agendamento realizado com sucesso');
    expect(resultado.agendamento.medico).toBe('Dr. João Silva');
    expect(resultado.agendamento.paciente).toBe('Carlos Almeida');
    expect(resultado.agendamento.data_horario).toBe('2026-06-10 09:00');
    expect(resultado.agendamento.id).toBeDefined();
    expect(agendamentoRepo.criar).toHaveBeenCalledTimes(1);
  });

  it('deve lançar NaoEncontradoError quando médico não existe', () => {
    const medicoRepo = criarMedicoRepositoryMock(undefined);
    const agendamentoRepo = criarAgendamentoRepositoryMock(false);
    const useCase = new CriarAgendamentoUseCase(medicoRepo, agendamentoRepo, criarLoggerMock());

    expect(() =>
      useCase.execute({
        medico_id: 999,
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 09:00',
      }),
    ).toThrow(NaoEncontradoError);

    try {
      useCase.execute({
        medico_id: 999,
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 09:00',
      });
    } catch (error) {
      expect((error as NaoEncontradoError).statusCode).toBe(404);
    }
  });

  it('deve lançar ValidationError quando horário não pertence à agenda do médico', () => {
    const medicoRepo = criarMedicoRepositoryMock(medicoMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock(false);
    const useCase = new CriarAgendamentoUseCase(medicoRepo, agendamentoRepo, criarLoggerMock());

    expect(() =>
      useCase.execute({
        medico_id: 1,
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 15:00',
      }),
    ).toThrow(ValidationError);
  });

  it('deve lançar HorarioIndisponivelError quando há conflito de horário', () => {
    const medicoRepo = criarMedicoRepositoryMock(medicoMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock(true);
    const useCase = new CriarAgendamentoUseCase(medicoRepo, agendamentoRepo, criarLoggerMock());

    expect(() =>
      useCase.execute({
        medico_id: 1,
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 09:00',
      }),
    ).toThrow(HorarioIndisponivelError);
  });

  it('HorarioIndisponivelError deve ter statusCode 409', () => {
    const medicoRepo = criarMedicoRepositoryMock(medicoMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock(true);
    const useCase = new CriarAgendamentoUseCase(medicoRepo, agendamentoRepo, criarLoggerMock());

    try {
      useCase.execute({
        medico_id: 1,
        paciente: 'Carlos Almeida',
        data_horario: '2026-06-10 09:00',
      });
      fail('Deveria ter lançado HorarioIndisponivelError');
    } catch (error) {
      expect(error).toBeInstanceOf(HorarioIndisponivelError);
      expect((error as HorarioIndisponivelError).statusCode).toBe(409);
      expect((error as HorarioIndisponivelError).erro).toBe('Horário indisponível');
    }
  });

  it('deve emitir logs de rastreamento sem dados pessoais', () => {
    const medicoRepo = criarMedicoRepositoryMock(medicoMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock(false);
    const logger = criarLoggerMock();
    const useCase = new CriarAgendamentoUseCase(medicoRepo, agendamentoRepo, logger);

    useCase.execute({ medico_id: 1, paciente: 'Carlos Almeida', data_horario: '2026-06-10 09:00' });

    const mensagensLogadas = logger.info.mock.calls.map((c) => c[0]);
    expect(mensagensLogadas).toContain('buscando medico');
    expect(mensagensLogadas).toContain('medico encontrado');
    expect(mensagensLogadas).toContain('verificando conflito de agendamento');
    expect(mensagensLogadas).toContain('adicionando agendamento');
    expect(mensagensLogadas).toContain('agendamento adicionado');

    // Verifica que 'paciente' e nome do médico nunca aparecem nos contextos logados
    const todosContextos = logger.info.mock.calls
      .map((c) => JSON.stringify(c[1] ?? {}))
      .join(' ');
    expect(todosContextos).not.toContain('Carlos Almeida');
    expect(todosContextos).not.toContain('Dr. João Silva');
  });
});
