import { InMemoryMedicoRepository } from '../infrastructure/repositories/in-memory-medico-repository.js';
import { InMemoryAgendamentoRepository } from '../infrastructure/repositories/in-memory-agendamento-repository.js';
import { Logger } from '../infrastructure/logger/logger.js';
import { ListarAgendasUseCase } from './use-cases/listar-agendas.js';
import { CriarAgendamentoUseCase } from './use-cases/criar-agendamento.js';

const medicoRepository = new InMemoryMedicoRepository();
const agendamentoRepository = new InMemoryAgendamentoRepository();

export function createListarAgendasUseCase(logger: Logger): ListarAgendasUseCase {
  return new ListarAgendasUseCase(medicoRepository, agendamentoRepository, logger);
}

export function createCriarAgendamentoUseCase(logger: Logger): CriarAgendamentoUseCase {
  return new CriarAgendamentoUseCase(medicoRepository, agendamentoRepository, logger);
}
