import { ServicoIaIndisponivelError } from '../../domain/errors/servico-ia-indisponivel-error.js';
import { IIaTriagemService, TriagemSugestao } from '../../domain/services/ia-triagem-service.js';

const ESPECIALIDADES_VALIDAS = [
  'Cardiologista',
  'Dermatologista',
  'Ortopedista',
  'Neurologista',
  'Clínico Geral',
  'Pediatra',
] as const;

const SYSTEM_PROMPT = `Você é um assistente de triagem médica. Com base nos sintomas descritos pelo paciente, indique a especialidade médica mais adequada para o atendimento.

Especialidades disponíveis: ${ESPECIALIDADES_VALIDAS.join(', ')}.

Regras:
- Responda SOMENTE com JSON válido, sem texto adicional, sem markdown, sem blocos de código.
- Se os sintomas forem vagos ou não permitirem uma indicação segura, use "Clínico Geral".
- Nunca invente especialidades fora da lista acima.
- A justificativa deve ser breve (1-2 frases) e em português.

Formato obrigatório:
{"especialidade": "<nome da especialidade>", "justificativa": "<explicação breve>"}`;

interface OpenAiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAiTriagemService implements IIaTriagemService {
  constructor(private readonly apiKey: string) {}

  async sugerirEspecialidade(sintomas: string): Promise<TriagemSugestao> {
    let response: Response;

    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Sintomas: ${sintomas}` },
          ],
        }),
      });
    } catch {
      throw new ServicoIaIndisponivelError('Falha de conexão com a API do modelo de linguagem.');
    }

    if (!response.ok) {
      throw new ServicoIaIndisponivelError(
        `A API do modelo de linguagem retornou status ${response.status}.`,
      );
    }

    let data: OpenAiResponse;
    try {
      data = (await response.json()) as OpenAiResponse;
    } catch {
      throw new ServicoIaIndisponivelError('Resposta da API do modelo de linguagem inválida.');
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new ServicoIaIndisponivelError('Resposta vazia recebida do modelo de linguagem.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new ServicoIaIndisponivelError(
        'O modelo de linguagem retornou uma resposta em formato inesperado.',
      );
    }

    const sugestao = parsed as Record<string, unknown>;

    if (
      typeof sugestao.especialidade !== 'string' ||
      typeof sugestao.justificativa !== 'string' ||
      !(ESPECIALIDADES_VALIDAS as readonly string[]).includes(sugestao.especialidade)
    ) {
      throw new ServicoIaIndisponivelError(
        'O modelo de linguagem retornou uma especialidade inválida.',
      );
    }

    return {
      especialidade: sugestao.especialidade,
      justificativa: sugestao.justificativa,
    };
  }
}
