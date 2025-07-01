/**
 * Enhanced logging utility with different log levels and structured output
 * Provides consistent logging across the application with performance tracking
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  private logs: Array<{ level: LogLevel; message: string; timestamp: number; data?: any }> = [];

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.logLevel) return;

    const timestamp = Date.now();
    const logEntry = { level, message, timestamp, data };
    
    // Store log entry (keep last 1000 entries)
    this.logs.push(logEntry);
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    // Console output with appropriate styling
    const styles = {
      [LogLevel.DEBUG]: 'color: #6B7280; font-weight: normal;',
      [LogLevel.INFO]: 'color: #3B82F6; font-weight: normal;',
      [LogLevel.WARN]: 'color: #F59E0B; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #EF4444; font-weight: bold;'
    };

    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const timeStr = new Date(timestamp).toISOString().substr(11, 12);
    
    console.log(
      `%c[${timeStr}] ${levelNames[level]}: ${message}`,
      styles[level],
      data || ''
    );
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): typeof this.logs {
    return this.logs.slice(-count);
  }

  /**
   * Export logs as JSON for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const logger = Logger.getInstance();