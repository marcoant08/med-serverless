# med-leve

API REST construída com Node.js, TypeScript, Serverless Framework e AWS Lambda.

## Pré-requisitos

- [Node.js v24](https://nodejs.org/)
- npm (incluído com o Node.js)
- [AWS CLI](https://aws.amazon.com/cli/) configurado com credenciais válidas (para deploy)

## Instalação

```bash
npm install
```

## Execução local

Inicia o servidor local usando o plugin `serverless-offline`:

```bash
npm run dev
```

O servidor ficará disponível em `http://localhost:3000`. Teste o endpoint:

```bash
curl http://localhost:3000/dev/hello
```

Resposta esperada:

```json
{ "success": true }
```

## Deploy na AWS

Certifique-se de que o AWS CLI está configurado com as credenciais corretas, então execute:

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
│   └── handlers/
│       └── hello.ts        # Handler do endpoint GET /hello
├── serverless.yml          # Configuração do Serverless Framework
├── tsconfig.json           # Configuração do TypeScript
├── package.json            # Dependências e scripts
└── README.md
```

## Scripts disponíveis

| Comando          | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Inicia o servidor local com serverless-offline |
| `npm run deploy` | Faz deploy da aplicação na AWS                 |
