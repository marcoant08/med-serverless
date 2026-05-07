# med-leve — API de Agendamento Médico

API REST para agendamento de consultas médicas, construída com **Node.js**, **TypeScript**, **Serverless Framework** e **AWS Lambda**.

## Decisões Arquiteturais

O projeto segue os princípios da **Clean Architecture**, organizado em 4 camadas com responsabilidades bem definidas:

```
src/
  domain/           → Entidades, interfaces de repositório e erros tipados (camada pura)
  application/      → Use cases com lógica de negócio e container de DI
  infrastructure/   → Implementações concretas dos repositórios (dados mockados em memória)
  presentation/     → Handlers Lambda, decorators e helpers HTTP
```

### Princípios aplicados

- **Separação de responsabilidades**: handlers são finos e delegam para use cases
- **Inversão de dependência**: use cases dependem de interfaces (domain), não de implementações concretas (infrastructure)
- **Erros como fluxo explícito**: erros de negócio são classes tipadas (`HorarioIndisponivelError`, `ValidationError`) com `statusCode` e mapeamento HTTP automático
- **Decorators para cross-cutting concerns**: `withErrorHandler` e `withValidation` encapsulam tratamento de erros e validação de payload sem poluir os handlers

## Pré-requisitos

- [Node.js v20+](https://nodejs.org/)
- npm (incluído com o Node.js)
- [AWS CLI](https://aws.amazon.com/cli/) configurado com credenciais válidas (apenas para deploy)

## Instalação

```bash
npm install
```

## Execução local

Inicia o servidor local usando o plugin `serverless-offline`:

```bash
npm run dev
```

O servidor ficará disponível em `http://localhost:3000`.

### Endpoints

#### GET /agendas

Retorna a lista de médicos com seus horários disponíveis.

```bash
curl http://localhost:3000/dev/agendas
```

Resposta (200):

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
    },
    {
      "id": 2,
      "nome": "Dra. Maria Souza",
      "especialidade": "Dermatologista",
      "horarios_disponiveis": [
        "2026-06-11 14:00",
        "2026-06-11 15:00"
      ]
    }
  ]
}
```

#### POST /agendamento

Registra um agendamento de consulta.

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

Resposta de sucesso (201):

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

Resposta de conflito (409) — horário já ocupado:

```json
{
  "erro": "Horário indisponível",
  "mensagem": "O horário solicitado não está mais disponível para este médico."
}
```

Resposta de validação (400) — payload inválido:

```json
{
  "erro": "Payload inválido",
  "mensagem": "O campo \"agendamento\" é obrigatório."
}
```

## Testes

Executa os testes unitários com Jest:

```bash
npm test
```

Os testes cobrem:
- **Use cases**: lógica de negócio (listagem de agendas, criação de agendamento, conflitos, validações)
- **Handlers**: integração com decorators, status codes e formato das respostas HTTP

## Lint e Formatação

```bash
npm run lint       # Verifica erros de lint com ESLint
npm run format     # Formata o código com Prettier
```

## Deploy na AWS

Certifique-se de que o AWS CLI está configurado com credenciais válidas:

```bash
npm run deploy
```

Para deploy em um stage específico:

```bash
npx serverless deploy --stage production
```

## Estrutura do projeto

```
├── src/
│   ├── domain/                          # Camada pura, sem dependências externas
│   │   ├── entities/
│   │   │   ├── medico.ts                #   Interface Medico
│   │   │   └── agendamento.ts           #   Interface Agendamento
│   │   ├── repositories/
│   │   │   ├── medico-repository.ts     #   Interface IMedicoRepository
│   │   │   └── agendamento-repository.ts#   Interface IAgendamentoRepository
│   │   └── errors/
│   │       ├── business-error.ts        #   Classe base de erros de negócio
│   │       ├── horario-indisponivel-error.ts #   Erro 409
│   │       └── validation-error.ts      #   Erro 400
│   ├── application/                     # Use cases e composição
│   │   ├── use-cases/
│   │   │   ├── listar-agendas.ts        #   ListarAgendasUseCase
│   │   │   └── criar-agendamento.ts     #   CriarAgendamentoUseCase
│   │   └── container.ts                 #   Composição de dependências (DI)
│   ├── infrastructure/                  # Implementações concretas
│   │   └── repositories/
│   │       ├── in-memory-medico-repository.ts      #   Dados mockados
│   │       └── in-memory-agendamento-repository.ts #   Armazena em memória
│   └── presentation/                    # Interface HTTP / Lambda
│       ├── handlers/
│       │   ├── get-agendas.ts           #   GET /agendas
│       │   └── create-agendamento.ts    #   POST /agendamento
│       ├── decorators/
│       │   ├── with-error-handler.ts    #   Tratamento de erros
│       │   └── with-validation.ts       #   Validação de payload
│       └── helpers/
│           └── http-response.ts         #   Helpers de resposta HTTP
├── tests/
│   ├── application/                     #   Testes dos use cases
│   └── presentation/                   #   Testes dos handlers
├── serverless.yml                       # Configuração Serverless Framework
├── tsconfig.json                        # Configuração TypeScript
├── jest.config.js                       # Configuração Jest
├── .eslintrc.json                       # Configuração ESLint
├── .prettierrc                          # Configuração Prettier
└── package.json                         # Dependências e scripts
```

## Scripts disponíveis

| Comando          | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Inicia o servidor local com serverless-offline |
| `npm run deploy` | Faz deploy da aplicação na AWS                 |
| `npm test`       | Executa os testes unitários                    |
| `npm run lint`   | Verifica erros de lint                         |
| `npm run format` | Formata o código com Prettier                  |
