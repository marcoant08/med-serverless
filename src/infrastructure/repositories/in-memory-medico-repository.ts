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
