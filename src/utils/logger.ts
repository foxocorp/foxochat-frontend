type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
    private static colors = {
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[37m',
    }

    private static logLevels: Record<string, LogLevel[]> = {
        production: ['info', 'error'],
        development: ['debug', 'info', 'warn', 'error'],
    }

    private static currentEnv: string = import.meta.env.MODE || 'development';

    private static isLogLevelEnabled(level: LogLevel): boolean {
        return this.logLevels[this.currentEnv]?.includes(level) ?? false;
    }

    private static logMessage(level: LogLevel, message: string) {
        if (this.isLogLevelEnabled(level)) {
            console.log(`${this.colors[level]}[${level.toUpperCase()}] ${message}`);
        }
    }

    static debug(message: string) {
        this.logMessage('debug', message);
    }

    static info(message: string) {
        this.logMessage('info', message);
    }

    static warn(message: string) {
        this.logMessage('warn', message);
    }

    static error(message: string) {
        this.logMessage('error', message);
    }
}
