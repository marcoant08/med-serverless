import { Logger } from '../../infrastructure/logger/logger.js';
import { agendamentoRepository, medicoRepository } from '../repositories.js';
import { ListarAgendasUseCase } from '../use-cases/listar-agendas.js';

export function createListarAgendasUseCase(logger: Logger): ListarAgendasUseCase {
  return new ListarAgendasUseCase(medicoRepository, agendamentoRepository, logger);
}
