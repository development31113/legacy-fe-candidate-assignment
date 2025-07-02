import { LogEntry } from '@/types';

class Logger {
  private formatMessage(level: LogEntry['level'], message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (process.env['NODE_ENV'] === 'development') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  // Request logging
  logRequest(method: string, url: string, statusCode: number, responseTime: number): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this[level](`${method} ${url} - ${statusCode} (${responseTime}ms)`);
  }

  // Error logging with stack trace
  logError(error: Error, context?: string): void {
    this.error(`${context ? `[${context}] ` : ''}${error.message}`, {
      stack: error.stack,
      name: error.name,
    });
  }
}

export const logger = new Logger();
export default logger; 