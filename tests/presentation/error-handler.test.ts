import { ErrorHandler } from '../../src/presentation/errors/error-handler';
import { Logger } from '../../src/infrastructure/logger/logger';
import { ValidationError } from '../../src/domain/errors/validation-error';
import { NaoEncontradoError } from '../../src/domain/errors/nao-encontrado-error';
import { HorarioIndisponivelError } from '../../src/domain/errors/horario-indisponivel-error';

function criarLoggerMock(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>;
}

describe('ErrorHandler', () => {
  let loggerMock: jest.Mocked<Logger>;
  let handler: ErrorHandler;

  beforeEach(() => {
    loggerMock = criarLoggerMock();
    handler = new ErrorHandler(loggerMock);
  });

  it('deve retornar 400 para ValidationError', () => {
    const error = new ValidationError('Campo inválido.');

    const result = handler.handle(error);

    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(400);
    expect(body.erro).toBe('Payload inválido');
    expect(body.mensagem).toBe('Campo inválido.');
  });

  it('deve retornar 404 para NaoEncontradoError', () => {
    const error = new NaoEncontradoError('Médico com id 99 não encontrado.');

    const result = handler.handle(error);

    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(404);
    expect(body.erro).toBe('Não encontrado');
    expect(body.mensagem).toBe('Médico com id 99 não encontrado.');
  });

  it('deve retornar 409 para HorarioIndisponivelError', () => {
    const error = new HorarioIndisponivelError();

    const result = handler.handle(error);

    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(409);
    expect(body.erro).toBe('Horário indisponível');
  });

  it('deve retornar 500 para erros desconhecidos', () => {
    const error = new Error('Falha inesperada');

    const result = handler.handle(error);

    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(500);
    expect(body.erro).toBe('Erro interno');
    expect(body.mensagem).toBe('Ocorreu um erro inesperado no servidor.');
  });

  it('deve retornar 500 para valores não-Error lançados', () => {
    const result = handler.handle('string de erro');

    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(500);
    expect(body.erro).toBe('Erro interno');
  });

  it('deve logar warn para BusinessError sem incluir a mensagem (LGPD)', () => {
    const error = new ValidationError('Nome do paciente: Carlos Almeida');

    handler.handle(error);

    expect(loggerMock.warn).toHaveBeenCalledWith('erro de negocio', {
      tipo: 'ValidationError',
      statusCode: 400,
    });
    const chamada = loggerMock.warn.mock.calls[0][1] as Record<string, unknown>;
    expect(chamada).not.toHaveProperty('mensagem');
    expect(chamada).not.toHaveProperty('message');
  });

  it('deve logar error com stack para erros inesperados', () => {
    const error = new Error('Falha crítica');

    handler.handle(error);

    expect(loggerMock.error).toHaveBeenCalledWith('erro inesperado', expect.objectContaining({
      message: 'Falha crítica',
      stack: expect.stringContaining('Falha crítica'),
    }));
  });

  it('deve retornar Content-Type application/json em todas as respostas', () => {
    const results = [
      handler.handle(new ValidationError('x')),
      handler.handle(new NaoEncontradoError('x')),
      handler.handle(new HorarioIndisponivelError()),
      handler.handle(new Error('x')),
    ];

    results.forEach((result) => {
      expect(result.headers?.['Content-Type']).toBe('application/json');
    });
  });
});
