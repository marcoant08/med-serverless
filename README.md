# med-leve — API de Agendamento Médico

API REST para agendamento de consultas médicas, com triagem inteligente via LLM. Construída com **Node.js 20**, **TypeScript**, **Serverless Framework** e **AWS Lambda**.

---

## Início rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite .env e preencha OPENAI_API_KEY

# 3. Iniciar servidor local
npm run dev
```

O servidor ficará disponível em `http://localhost:3000`.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| [Node.js](https://nodejs.org/) | 20 |
| npm | incluído com o Node.js |
| Chave de API OpenAI | obrigatória para o endpoint `/triagem` |
| [AWS CLI](https://aws.amazon.com/cli/) | qualquer (só para deploy) |

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (nunca versione este arquivo):

```bash
OPENAI_API_KEY=sk-proj-...sua-chave-aqui...
```

Obtenha sua chave em [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

O `serverless-dotenv-plugin` carrega o `.env` automaticamente ao rodar `npm run dev`. Para deploy na AWS, configure a variável no ambiente antes de fazer deploy.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor local com `serverless-offline` |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm test` | Testes unitários com Jest |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | Lint com ESLint |
| `npm run format` | Formata código com Prettier |
| `npm run deploy` | Deploy na AWS |

---

## Endpoints

### GET /agendas

Retorna todos os médicos com seus horários disponíveis.

```bash
curl http://localhost:3000/dev/agendas
```

Resposta `200`:

```json
{
  "medicos": [
    {
      "id": 1,
      "nome": "Dr. João Silva",
      "especialidade": "Cardiologista",
      "horarios_disponiveis": [
        "2026-06-10 09:00",
        "2026-06-10 10:00",
        "2026-06-10 11:00"
      ]
    }
  ]
}
```

---

### POST /agendamento

Registra uma consulta para um paciente.

```bash
curl -X POST http://localhost:3000/dev/agendamento \
  -H 'Content-Type: application/json' \
  -d '{
    "agendamento": {
      "medico_id": 1,
      "paciente": "Carlos Almeida",
      "data_horario": "2026-06-10 09:00"
    }
  }'
```

**Campos obrigatórios:**

| Campo | Tipo | Formato |
|---|---|---|
| `medico_id` | número inteiro | ID do médico retornado pelo GET /agendas |
| `paciente` | string | Nome do paciente |
| `data_horario` | string | `"AAAA-MM-DD HH:MM"` (ex.: `"2026-06-10 09:00"`) |

Resposta `201` — sucesso:

```json
{
  "mensagem": "Agendamento realizado com sucesso",
  "agendamento": {
    "id": "uuid-gerado",
    "medico_id": 1,
    "medico": "Dr. João Silva",
    "paciente": "Carlos Almeida",
    "data_horario": "2026-06-10 09:00"
  }
}
```

---

### POST /triagem

Recebe a descrição dos sintomas em texto livre e retorna uma sugestão de especialidade médica usando um modelo de linguagem (LLM). **Requer `OPENAI_API_KEY` configurada.**

```bash
curl -X POST http://localhost:3000/dev/triagem \
  -H 'Content-Type: application/json' \
  -d '{
    "sintomas": "dor no peito e falta de ar ao subir escadas"
  }'
```

**Campos obrigatórios:**

| Campo | Tipo | Restrição |
|---|---|---|
| `sintomas` | string | Mínimo de 10 caracteres |

Resposta `200` — sucesso:

```json
{
  "sugestao": {
    "especialidade": "Cardiologista",
    "justificativa": "Os sintomas de dor no peito e falta de ar são indicativos de problemas cardíacos e requerem avaliação cardiológica."
  }
}
```

Especialidades possíveis: `Cardiologista`, `Dermatologista`, `Ortopedista`, `Neurologista`, `Clínico Geral`, `Pediatra`.

Resposta `503` — serviço de IA indisponível (chave inválida, sem créditos, falha de rede):

```json
{
  "code": "2001",
  "erro": "Serviço de IA indisponível",
  "mensagem": "A API do modelo de linguagem retornou status 401."
}
```

---

## Respostas de erro

Todos os erros seguem o mesmo formato:

```json
{
  "code": "1001",
  "erro": "Payload inválido",
  "mensagem": "Descrição detalhada do problema."
}
```

| `code` | HTTP | `erro` | Situação |
|---|---|---|---|
| `1001` | 400 | Payload inválido | Campo ausente ou tipo incorreto |
| `1002` | 404 | Não encontrado | Médico não existe |
| `1003` | 409 | Horário indisponível | Horário já agendado |
| `1004` | 404 | Rota não encontrada | Endpoint inexistente |
| `2001` | 503 | Serviço de IA indisponível | Falha na chamada ao LLM |
| `9999` | 500 | Erro interno | Erro inesperado no servidor |

---

## Estrutura do projeto

```
src/
├── domain/                        # Camada pura — sem dependências externas
│   ├── entities/                  #   Tipos Medico e Agendamento
│   ├── repositories/              #   Interfaces de repositório
│   ├── services/                  #   Interface IIaTriagemService
│   └── errors/                    #   BusinessError, erros tipados e ErrorCode (enum)
├── application/                   # Regras de negócio
│   ├── use-cases/                 #   ListarAgendasUseCase, CriarAgendamentoUseCase, TriagemUseCase
│   ├── factories/                 #   Factories de use cases (injetam Logger + dependências)
│   └── repositories.ts            #   Singletons dos repositórios
├── infrastructure/                # Implementações concretas
│   ├── logger/                    #   Logger com saída JSON estruturada (CloudWatch)
│   ├── repositories/              #   Repositórios in-memory com dados mockados
│   └── ia/                        #   OpenAiTriagemService — integração com a API OpenAI
└── presentation/                  # Interface HTTP / Lambda
    ├── handlers/                  #   get-agendas, create-agendamento, triagem, not-found
    ├── decorators/                #   @withLogging, @withErrorHandler, @withValidation
    ├── errors/                    #   ErrorHandler centralizado
    ├── validations/               #   Schemas Zod (agendamento, triagem)
    └── helpers/                   #   Helpers de resposta HTTP

tests/
├── application/                   # Testes dos use cases
├── infrastructure/                # Testes do Logger e OpenAiTriagemService
└── presentation/                  # Testes dos handlers e decorators
```

---

## Arquitetura

O projeto segue **Clean Architecture** com 4 camadas:

- **Domain** — entidades, interfaces e erros tipados; sem dependências externas
- **Application** — use cases com lógica de negócio; depende apenas de interfaces do domain
- **Infrastructure** — implementações concretas (repositórios in-memory, logger JSON, OpenAI)
- **Presentation** — handlers Lambda com decorators `@` para cross-cutting concerns

### Decisões técnicas

- **Zod** para validação de payload com mensagens de erro em português
- **Decorators TypeScript** (`@withLogging`, `@withErrorHandler`, `@withValidation`) para separar concerns sem poluir handlers
- **Logger JSON estruturado** compatível com CloudWatch, com `requestId` para rastreamento por request; sem dados pessoais (conformidade LGPD)
- **Enum `ErrorCode`** centralizando todos os códigos de erro da aplicação
- **Factories de use cases** para injeção de Logger por request, mantendo repositórios como singletons
- **Integração LLM via interface** — `IIaTriagemService` no domain; `OpenAiTriagemService` na infrastructure; use case não conhece a implementação concreta
- **`fetch` nativo do Node 20** para chamadas à API OpenAI, sem dependências adicionais
- **Prompt com `temperature: 0`** e resposta em JSON puro para resultados determinísticos

---

## Deploy na AWS

Certifique-se de que o AWS CLI está configurado com credenciais válidas e exporte a variável de ambiente antes de fazer deploy:

```bash
export OPENAI_API_KEY=sk-proj-...

npm run deploy

# Para um stage específico:
npx serverless deploy --stage production
```
