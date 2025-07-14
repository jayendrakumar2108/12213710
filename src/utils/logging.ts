// Affordmed URL Shortener - Logging Middleware
// Mock implementation of the required logging system

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO', 
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId: string;
}

class Logger {
  private sessionId: string;
  private logs: LogEntry[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.info('Logger', 'Logger initialized for new session');
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private createLogEntry(level: LogLevel, component: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      sessionId: this.sessionId
    };
  }

  private writeLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Store in localStorage for persistence
    const existingLogs = this.getStoredLogs();
    existingLogs.push(entry);
    localStorage.setItem('affordmed_logs', JSON.stringify(existingLogs));

    // Console output for development (with color coding)
    const colors = {
      [LogLevel.DEBUG]: '#6B7280',
      [LogLevel.INFO]: '#3B82F6', 
      [LogLevel.WARN]: '#F59E0B',
      [LogLevel.ERROR]: '#EF4444'
    };

    console.log(
      `%c[${entry.level}] ${entry.component}: ${entry.message}`,
      `color: ${colors[entry.level]}; font-weight: bold;`,
      entry.data ? entry.data : ''
    );
  }

  private getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('affordmed_logs') || '[]');
    } catch {
      return [];
    }
  }

  debug(component: string, message: string, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.DEBUG, component, message, data));
  }

  info(component: string, message: string, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.INFO, component, message, data));
  }

  warn(component: string, message: string, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.WARN, component, message, data));
  }

  error(component: string, message: string, data?: any): void {
    this.writeLog(this.createLogEntry(LogLevel.ERROR, component, message, data));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getAllLogs(): LogEntry[] {
    return this.getStoredLogs();
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('affordmed_logs');
    this.info('Logger', 'All logs cleared');
  }
}

// Global logger instance
export const logger = new Logger();

// Hook for React components
export const useLogger = () => logger;