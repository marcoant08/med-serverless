import { InMemoryAgendamentoRepository } from '../infrastructure/repositories/in-memory-agendamento-repository.js';
import { InMemoryMedicoRepository } from '../infrastructure/repositories/in-memory-medico-repository.js';

export const medicoRepository = new InMemoryMedicoRepository();
export const agendamentoRepository = new InMemoryAgendamentoRepository();
