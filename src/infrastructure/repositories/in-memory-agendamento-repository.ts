import { Agendamento } from '../../domain/entities/agendamento.js';
import { IAgendamentoRepository } from '../../domain/repositories/agendamento-repository.js';

export class InMemoryAgendamentoRepository implements IAgendamentoRepository {
  private readonly agendamentos: Map<string, Agendamento> = new Map();

  private buildKey(medicoId: number, dataHorario: string): string {
    return `${medicoId}::${dataHorario}`;
  }

  criar(agendamento: Agendamento): void {
    const key = this.buildKey(agendamento.medico_id, agendamento.data_horario);
    this.agendamentos.set(key, agendamento);
  }

  existeConflito(medicoId: number, dataHorario: string): boolean {
    const key = this.buildKey(medicoId, dataHorario);
    return this.agendamentos.has(key);
  }

  listarPorMedico(medicoId: number): Agendamento[] {
    return Array.from(this.agendamentos.values()).filter((a) => a.medico_id === medicoId);
  }
}
