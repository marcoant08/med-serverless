# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.1] - 2026-05-08

### Added
- Handler `notFound` em `src/presentation/handlers/not-found.ts` que retorna 404 no formato padrão da API (`{ erro, mensagem }`) para rotas não mapeadas
- Rota catch-all `/{proxy+}` com método `any` registrada em `serverless.yml` após as demais rotas, substituindo o erro padrão do serverless-offline

## [0.5.0] - 2026-05-08

### Added
- `Logger` em `src/infrastructure/logger/logger.ts` com saída JSON estruturada para stdout (CloudWatch compatível), incluindo `timestamp`, `level`, `requestId` (tracer) e `context`
- Decorator `withLogging` que loga `request recebida` e `request concluida` (method, path, statusCode, durationMs) sem expor dados do body
- Logs de rastreamento de negócio em `CriarAgendamentoUseCase`: `buscando medico`, `medico encontrado`, `verificando conflito de agendamento`, `adicionando agendamento`, `agendamento adicionado`
- Log `buscando agendamentos` em `ListarAgendasUseCase`
- Testes unitários para `Logger` e `withLogging`, incluindo verificações de conformidade com LGPD

### Changed
- `ErrorHandler` recebe `Logger` via construtor; loga `warn` para `BusinessError` (sem `message`, que pode conter dados pessoais) e `error` com stack para erros inesperados
- `withErrorHandler` instancia `Logger` e `ErrorHandler` por request usando o `context.awsRequestId` como tracer
- `Logger` injetado via construtor nos use cases; `container.ts` convertido para exportar factories de use cases (`createCriarAgendamentoUseCase`, `createListarAgendasUseCase`) mantendo repositórios como singletons
- Handlers aplicam `withLogging` como decorator mais externo: `withLogging(withErrorHandler(...))`

## [0.4.1] - 2026-05-08

### Added
- Classe `ErrorHandler` em `src/presentation/errors/error-handler.ts` como ponto centralizado de mapeamento de erros para respostas HTTP
- Testes unitários para `ErrorHandler` cobrindo todos os tipos de erro de domínio e erros inesperados

### Changed
- `withErrorHandler` delegado ao `ErrorHandler` centralizado, removendo lógica de mapeamento inline do decorator

## [0.4.0] - 2026-05-08

### Changed
- Substituída biblioteca de validação Joi pelo Zod (v4) no decorator `withValidation` e no handler `create-agendamento`
- `withValidation` agora recebe `ZodSchema` ao invés de `Joi.ObjectSchema`
- Schema de validação do POST /agendamento reescrito com `z.object()` e mensagens de erro customizadas

### Removed
- Dependência `joi` removida do projeto

## [0.3.0] - 2026-05-07

### Added
- Erro tipado `NaoEncontradoError` (404) para recursos não encontrados

### Changed
- Médico não encontrado agora retorna 404 ao invés de 400

## [0.2.0] - 2026-05-07

### Added
- Validação de payload com Joi no endpoint POST /agendamento
- Schema declarativo com mensagens de erro customizadas em português
- Opção `convert: false` no Joi para rejeitar coerção implícita de tipos

### Changed
- Decorator `withValidation` agora recebe um `Joi.ObjectSchema` ao invés de funções manuais
- Removida validação manual do handler `create-agendamento`

## [0.1.0] - 2026-05-06

### Added
- Estrutura inicial do projeto com Clean Architecture (domain, application, infrastructure, presentation)
- Endpoint GET /agendas com lista de médicos e horários disponíveis
- Endpoint POST /agendamento com criação de agendamento e controle de conflito em memória
- Entidades `Medico` e `Agendamento` com tipagem TypeScript
- Erros tipados: `BusinessError`, `HorarioIndisponivelError` (409), `ValidationError` (400)
- Repositórios in-memory com dados mockados
- Use cases `ListarAgendasUseCase` e `CriarAgendamentoUseCase` com injeção de dependência
- Decorators `withErrorHandler` e `withValidation` para cross-cutting concerns
- Configuração do Serverless Framework com serverless-offline e serverless-esbuild
- Testes unitários com Jest (use cases e handlers)
- ESLint, Prettier e TypeScript strict mode
- README com instruções de execução local
