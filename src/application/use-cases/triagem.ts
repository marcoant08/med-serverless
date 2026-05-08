import { IIaTriagemService, TriagemSugestao } from '../../domain/services/ia-triagem-service.js';
import { Logger } from '../../infrastructure/logger/logger.js';

export interface TriagemOutput {
  readonly sugestao: TriagemSugestao;
}

export class TriagemUseCase {
  constructor(
    private readonly iaService: IIaTriagemService,
    private readonly logger: Logger,
  ) {}

  async execute(sintomas: string): Promise<TriagemOutput> {
    this.logger.info('iniciando triagem');
    const sugestao = await this.iaService.sugerirEspecialidade(sintomas);
    this.logger.info('triagem concluida', { especialidade: sugestao.especialidade });
    return { sugestao };
  }
}
