import { Agendamento } from '../entities/agendamento.js';

export interface IAgendamentoRepository {
  criar(agendamento: Agendamento): void;
  existeConflito(medicoId: number, dataHorario: string): boolean;
  listarPorMedico(medicoId: number): Agendamento[];
}
