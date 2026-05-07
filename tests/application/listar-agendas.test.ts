import { ListarAgendasUseCase } from '../../src/application/use-cases/listar-agendas';
import { Medico } from '../../src/domain/entities/medico';
import { Agendamento } from '../../src/domain/entities/agendamento';
import { IMedicoRepository } from '../../src/domain/repositories/medico-repository';
import { IAgendamentoRepository } from '../../src/domain/repositories/agendamento-repository';

function criarMedicoRepositoryMock(medicos: Medico[]): IMedicoRepository {
  return {
    listarTodos: jest.fn(() => medicos),
    buscarPorId: jest.fn((id: number) => medicos.find((m) => m.id === id)),
  };
}

function criarAgendamentoRepositoryMock(agendamentos: Agendamento[]): IAgendamentoRepository {
  return {
    criar: jest.fn(),
    existeConflito: jest.fn(),
    listarPorMedico: jest.fn((medicoId: number) =>
      agendamentos.filter((a) => a.medico_id === medicoId),
    ),
  };
}

describe('ListarAgendasUseCase', () => {
  const medicosMock: Medico[] = [
    {
      id: 1,
      nome: 'Dr. João Silva',
      especialidade: 'Cardiologista',
      horarios_disponiveis: ['2026-06-10 09:00', '2026-06-10 10:00'],
    },
    {
      id: 2,
      nome: 'Dra. Maria Souza',
      especialidade: 'Dermatologista',
      horarios_disponiveis: ['2026-06-11 14:00'],
    },
  ];

  it('deve retornar todos os médicos com seus horários disponíveis', () => {
    const medicoRepo = criarMedicoRepositoryMock(medicosMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock([]);
    const useCase = new ListarAgendasUseCase(medicoRepo, agendamentoRepo);

    const resultado = useCase.execute();

    expect(resultado.medicos).toHaveLength(2);
    expect(resultado.medicos[0].nome).toBe('Dr. João Silva');
    expect(resultado.medicos[0].horarios_disponiveis).toEqual([
      '2026-06-10 09:00',
      '2026-06-10 10:00',
    ]);
    expect(resultado.medicos[1].horarios_disponiveis).toEqual(['2026-06-11 14:00']);
  });

  it('deve filtrar horários já agendados', () => {
    const agendamentoExistente: Agendamento = {
      id: 'uuid-1',
      medico_id: 1,
      medico: 'Dr. João Silva',
      paciente: 'Carlos Almeida',
      data_horario: '2026-06-10 09:00',
    };

    const medicoRepo = criarMedicoRepositoryMock(medicosMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock([agendamentoExistente]);
    const useCase = new ListarAgendasUseCase(medicoRepo, agendamentoRepo);

    const resultado = useCase.execute();

    expect(resultado.medicos[0].horarios_disponiveis).toEqual(['2026-06-10 10:00']);
    expect(resultado.medicos[1].horarios_disponiveis).toEqual(['2026-06-11 14:00']);
  });

  it('deve retornar lista vazia de horários quando todos estão ocupados', () => {
    const agendamentos: Agendamento[] = [
      {
        id: 'uuid-1',
        medico_id: 2,
        medico: 'Dra. Maria Souza',
        paciente: 'Ana',
        data_horario: '2026-06-11 14:00',
      },
    ];

    const medicoRepo = criarMedicoRepositoryMock(medicosMock);
    const agendamentoRepo = criarAgendamentoRepositoryMock(agendamentos);
    const useCase = new ListarAgendasUseCase(medicoRepo, agendamentoRepo);

    const resultado = useCase.execute();

    expect(resultado.medicos[1].horarios_disponiveis).toEqual([]);
  });
});
