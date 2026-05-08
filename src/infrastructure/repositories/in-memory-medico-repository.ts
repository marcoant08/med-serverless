import { Medico } from '../../domain/entities/medico.js';
import { IMedicoRepository } from '../../domain/repositories/medico-repository.js';

const MEDICOS_MOCK: Medico[] = [
  {
    id: 1,
    nome: 'Dr. João Silva',
    especialidade: 'Cardiologista',
    horarios_disponiveis: ['2026-06-10 09:00', '2026-06-10 10:00', '2026-06-10 11:00'],
  },
  {
    id: 2,
    nome: 'Dra. Maria Souza',
    especialidade: 'Dermatologista',
    horarios_disponiveis: ['2026-06-11 14:00', '2026-06-11 15:00'],
  },
  {
    id: 3,
    nome: 'Dr. Carlos Mendes',
    especialidade: 'Ortopedista',
    horarios_disponiveis: ['2026-06-12 08:00', '2026-06-12 09:00', '2026-06-12 10:00'],
  },
  {
    id: 4,
    nome: 'Dra. Ana Ferreira',
    especialidade: 'Neurologista',
    horarios_disponiveis: ['2026-06-13 13:00', '2026-06-13 14:00', '2026-06-13 15:00'],
  },
  {
    id: 5,
    nome: 'Dr. Paulo Rocha',
    especialidade: 'Clínico Geral',
    horarios_disponiveis: ['2026-06-10 14:00', '2026-06-10 15:00', '2026-06-11 08:00', '2026-06-11 09:00'],
  },
  {
    id: 6,
    nome: 'Dra. Beatriz Lima',
    especialidade: 'Pediatra',
    horarios_disponiveis: ['2026-06-12 11:00', '2026-06-12 14:00', '2026-06-13 08:00'],
  },
];

export class InMemoryMedicoRepository implements IMedicoRepository {
  private readonly medicos: Medico[] = MEDICOS_MOCK;

  listarTodos(): Medico[] {
    return this.medicos;
  }

  buscarPorId(id: number): Medico | undefined {
    return this.medicos.find((m) => m.id === id);
  }
}
