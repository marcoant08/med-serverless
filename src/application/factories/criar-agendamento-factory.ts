import { Logger } from '../../infrastructure/logger/logger.js';
import { agendamentoRepository, medicoRepository } from '../repositories.js';
import { CriarAgendamentoUseCase } from '../use-cases/criar-agendamento.js';

export function createCriarAgendamentoUseCase(logger: Logger): CriarAgendamentoUseCase {
  return new CriarAgendamentoUseCase(medicoRepository, agendamentoRepository, logger);
}
