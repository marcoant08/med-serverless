import { InMemoryMedicoRepository } from '../infrastructure/repositories/in-memory-medico-repository.js';
import { InMemoryAgendamentoRepository } from '../infrastructure/repositories/in-memory-agendamento-repository.js';
import { ListarAgendasUseCase } from './use-cases/listar-agendas.js';
import { CriarAgendamentoUseCase } from './use-cases/criar-agendamento.js';

const medicoRepository = new InMemoryMedicoRepository();
const agendamentoRepository = new InMemoryAgendamentoRepository();

export const listarAgendasUseCase = new ListarAgendasUseCase(medicoRepository, agendamentoRepository);
export const criarAgendamentoUseCase = new CriarAgendamentoUseCase(medicoRepository, agendamentoRepository);
