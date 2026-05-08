import { Logger, LogEntry } from '../../src/infrastructure/logger/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function ultimaEntradaLogada(): LogEntry {
    const ultimaChamada = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0];
    return JSON.parse(ultimaChamada) as LogEntry;
  }

  it('deve emitir JSON válido com campos obrigatórios', () => {
    const logger = new Logger('req-123');
    logger.info('teste');

    const entrada = ultimaEntradaLogada();
    expect(entrada.timestamp).toBeDefined();
    expect(new Date(entrada.timestamp).toISOString()).toBe(entrada.timestamp);
    expect(entrada.level).toBe('INFO');
    expect(entrada.requestId).toBe('req-123');
    expect(entrada.message).toBe('[teste]');
  });

  it('deve incluir o context quando fornecido', () => {
    const logger = new Logger('req-abc');
    logger.info('com contexto', { medico_id: 1, data_horario: '2026-06-10 09:00' });

    const entrada = ultimaEntradaLogada();
    expect(entrada.context).toEqual({ medico_id: 1, data_horario: '2026-06-10 09:00' });
  });

  it('não deve incluir o campo context quando não fornecido', () => {
    const logger = new Logger();
    logger.info('sem contexto');

    const entrada = ultimaEntradaLogada();
    expect(entrada).not.toHaveProperty('context');
  });

  it('deve emitir level WARN corretamente', () => {
    const logger = new Logger('req-warn');
    logger.warn('aviso', { tipo: 'ValidationError', statusCode: 400 });

    const entrada = ultimaEntradaLogada();
    expect(entrada.level).toBe('WARN');
    expect(entrada.message).toBe('[aviso]');
  });

  it('deve emitir level ERROR corretamente', () => {
    const logger = new Logger('req-err');
    logger.error('erro grave', { message: 'stack trace aqui' });

    const entrada = ultimaEntradaLogada();
    expect(entrada.level).toBe('ERROR');
    expect(entrada.message).toBe('[erro grave]');
  });

  it('deve funcionar sem requestId', () => {
    const logger = new Logger();
    logger.info('sem request id');

    const entrada = ultimaEntradaLogada();
    expect(entrada.requestId).toBeUndefined();
    expect(entrada.message).toBe('[sem request id]');
  });

  it('o requestId deve ser o tracer propagado em todos os logs da mesma instância', () => {
    const logger = new Logger('tracer-xyz');
    logger.info('passo 1');
    logger.warn('passo 2');
    logger.error('passo 3');

    const entradas = consoleSpy.mock.calls.map((c) => JSON.parse(c[0]) as LogEntry);
    entradas.forEach((e) => expect(e.requestId).toBe('tracer-xyz'));
  });
});
