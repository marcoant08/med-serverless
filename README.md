# med-leve — API de Agendamento Médico

API REST para agendamento de consultas médicas, construída com **Node.js 20**, **TypeScript**, **Serverless Framework** e **AWS Lambda**.

---

## Início rápido

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor local
npm run dev
```

O servidor ficará disponível em `http://localhost:3000`.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| [Node.js](https://nodejs.org/) | 20 |
| npm | incluído com o Node.js |
| [AWS CLI](https://aws.amazon.com/cli/) | qualquer (só para deploy) |

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
| `9999` | 500 | Erro interno | Erro inesperado no servidor |

---

## Estrutura do projeto

```
src/
├── domain/                        # Camada pura — sem dependências externas
│   ├── entities/                  #   Tipos Medico e Agendamento
│   ├── repositories/              #   Interfaces de repositório
│   └── errors/                    #   BusinessError, erros tipados e ErrorCode (enum)
├── application/                   # Regras de negócio
│   ├── use-cases/                 #   ListarAgendasUseCase, CriarAgendamentoUseCase
│   ├── factories/                 #   Factories de use cases (injetam Logger + repositórios)
│   └── repositories.ts            #   Singletons dos repositórios
├── infrastructure/                # Implementações concretas
│   ├── logger/                    #   Logger com saída JSON estruturada (CloudWatch)
│   └── repositories/              #   Repositórios in-memory com dados mockados
└── presentation/                  # Interface HTTP / Lambda
    ├── handlers/                  #   get-agendas, create-agendamento, not-found
    ├── decorators/                #   @withLogging, @withErrorHandler, @withValidation
    ├── errors/                    #   ErrorHandler centralizado
    ├── validations/               #   Schemas Zod
    └── helpers/                   #   Helpers de resposta HTTP

tests/
├── application/                   # Testes dos use cases
├── infrastructure/                # Testes do Logger
└── presentation/                  # Testes dos handlers e decorators
```

---

## Arquitetura

O projeto segue **Clean Architecture** com 4 camadas:

- **Domain** — entidades, interfaces e erros tipados; sem dependências externas
- **Application** — use cases com lógica de negócio; depende apenas de interfaces do domain
- **Infrastructure** — implementações concretas (repositórios in-memory, logger JSON)
- **Presentation** — handlers Lambda com decorators `@` para cross-cutting concerns

### Decisões técnicas

- **Zod** para validação de payload com mensagens de erro em português
- **Decorators TypeScript** (`@withLogging`, `@withErrorHandler`, `@withValidation`) para separar concerns sem poluir handlers
- **Logger JSON estruturado** compatível com CloudWatch, com `requestId` para rastreamento por request; sem dados pessoais (conformidade LGPD)
- **Enum `ErrorCode`** centralizando todos os códigos de erro da aplicação
- **Factories de use cases** para injeção de Logger por request, mantendo repositórios como singletons

---

## Deploy na AWS

Certifique-se de que o AWS CLI está configurado com credenciais válidas:

```bash
npm run deploy

# Para um stage específico:
npx serverless deploy --stage production
```
