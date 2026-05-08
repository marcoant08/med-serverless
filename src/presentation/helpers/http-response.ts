import { APIGatewayProxyResult } from 'aws-lambda';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

export function ok(body: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

export function created(body: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode: 201,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

export function errorResponse(
  statusCode: number,
  erro: string,
  mensagem: string,
  code: string,
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify({ code, erro, mensagem }),
  };
}
