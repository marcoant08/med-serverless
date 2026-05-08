import { ServicoIaIndisponivelError } from '../../src/domain/errors/servico-ia-indisponivel-error';
import { IIaTriagemService, TriagemSugestao } from '../../src/domain/services/ia-triagem-service';
import { Logger } from '../../src/infrastructure/logger/logger';
import { TriagemUseCase } from '../../src/application/use-cases/triagem';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as Logger;

const mockIaService: IIaTriagemService = {
  sugerirEspecialidade: jest.fn(),
};

describe('TriagemUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar sugestão de especialidade com sucesso', async () => {
    const sugestao: TriagemSugestao = {
      especialidade: 'Cardiologista',
      justificativa: 'Sintomas relacionados ao coração.',
    };
    (mockIaService.sugerirEspecialidade as jest.Mock).mockResolvedValue(sugestao);

    const useCase = new TriagemUseCase(mockIaService, mockLogger);
    const resultado = await useCase.execute('dor no peito e falta de ar');

    expect(resultado.sugestao).toEqual(sugestao);
  });

  it('deve logar inicio e conclusão da triagem', async () => {
    (mockIaService.sugerirEspecialidade as jest.Mock).mockResolvedValue({
      especialidade: 'Neurologista',
      justificativa: 'Sintomas neurológicos.',
    });

    const useCase = new TriagemUseCase(mockIaService, mockLogger);
    await useCase.execute('dores de cabeça constantes e tontura');

    expect(mockLogger.info).toHaveBeenCalledWith('iniciando triagem');
    expect(mockLogger.info).toHaveBeenCalledWith('triagem concluida', {
      especialidade: 'Neurologista',
    });
  });

  it('deve propagar ServicoIaIndisponivelError quando o serviço falha', async () => {
    (mockIaService.sugerirEspecialidade as jest.Mock).mockRejectedValue(
      new ServicoIaIndisponivelError('Falha de conexão'),
    );

    const useCase = new TriagemUseCase(mockIaService, mockLogger);

    await expect(useCase.execute('febre alta e calafrios')).rejects.toThrow(
      ServicoIaIndisponivelError,
    );
  });
});
