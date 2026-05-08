import { ServicoIaIndisponivelError } from '../../src/domain/errors/servico-ia-indisponivel-error';
import { OpenAiTriagemService } from '../../src/infrastructure/ia/openai-triagem-service';

function mockFetch(status: number, body: unknown, rejeitar = false): void {
  global.fetch = rejeitar
    ? jest.fn().mockRejectedValue(new Error('network error'))
    : jest.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: jest.fn().mockResolvedValue(body),
      } as unknown as Response);
}

function respostaOpenAi(especialidade: string, justificativa: string): unknown {
  return {
    choices: [
      {
        message: {
          content: JSON.stringify({ especialidade, justificativa }),
        },
      },
    ],
  };
}

describe('OpenAiTriagemService', () => {
  const service = new OpenAiTriagemService('test-api-key');

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve retornar especialidade válida para resposta correta da API', async () => {
    mockFetch(200, respostaOpenAi('Cardiologista', 'Sintomas cardíacos.'));

    const resultado = await service.sugerirEspecialidade('dor no peito');

    expect(resultado.especialidade).toBe('Cardiologista');
    expect(resultado.justificativa).toBe('Sintomas cardíacos.');
  });

  it('deve lançar ServicoIaIndisponivelError em erro de rede', async () => {
    mockFetch(0, null, true);

    await expect(service.sugerirEspecialidade('dor no peito')).rejects.toThrow(
      ServicoIaIndisponivelError,
    );
  });

  it('deve lançar ServicoIaIndisponivelError quando status HTTP não é 2xx', async () => {
    mockFetch(500, {});

    await expect(service.sugerirEspecialidade('febre')).rejects.toThrow(
      ServicoIaIndisponivelError,
    );
  });

  it('deve lançar ServicoIaIndisponivelError quando resposta não é JSON válido', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'isso nao e json' } }],
      }),
    } as unknown as Response);

    await expect(service.sugerirEspecialidade('febre')).rejects.toThrow(
      ServicoIaIndisponivelError,
    );
  });

  it('deve lançar ServicoIaIndisponivelError quando especialidade não está na lista', async () => {
    mockFetch(200, respostaOpenAi('Psiquiatra', 'Sintomas psiquiátricos.'));

    await expect(service.sugerirEspecialidade('ansiedade')).rejects.toThrow(
      ServicoIaIndisponivelError,
    );
  });

  it('deve lançar ServicoIaIndisponivelError quando resposta está vazia', async () => {
    mockFetch(200, { choices: [{ message: { content: '' } }] });

    await expect(service.sugerirEspecialidade('febre')).rejects.toThrow(
      ServicoIaIndisponivelError,
    );
  });

  it('deve lançar ServicoIaIndisponivelError quando choices está ausente', async () => {
    mockFetch(200, {});

    await expect(service.sugerirEspecialidade('febre')).rejects.toThrow(
      ServicoIaIndisponivelError,
    );
  });
});
