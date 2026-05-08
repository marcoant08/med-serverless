export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId?: string;
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  constructor(private readonly requestId?: string) {}

  info(message: string, context?: Record<string, unknown>): void {
    this.emit('INFO', `[${message}]`, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit('WARN', `[${message}]`, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.emit('ERROR', `[${message}]`, context);
  }

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: this.requestId,
      message,
      ...(context && { context }),
    };
    console.log(JSON.stringify(entry));
  }
}
