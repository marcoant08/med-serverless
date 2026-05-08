import { OpenAiTriagemService } from '../../infrastructure/ia/openai-triagem-service.js';
import { Logger } from '../../infrastructure/logger/logger.js';
import { TriagemUseCase } from '../use-cases/triagem.js';

export function createTriagemUseCase(logger: Logger): TriagemUseCase {
  const iaService = new OpenAiTriagemService(process.env.OPENAI_API_KEY ?? '');
  return new TriagemUseCase(iaService, logger);
}
