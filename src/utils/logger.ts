export enum LogLevel {
    Debug = 1,
    Info = 2,
    Warn = 4,
    Error = 8,
}

export class Logger {
    private static colors: Record<LogLevel, string> = {
        [LogLevel.Info]: "\x1b[32m",
        [LogLevel.Warn]: "\x1b[33m",
        [LogLevel.Error]: "\x1b[31m",
        [LogLevel.Debug]: "\x1b[37m",
    };

    private static logLevels: Record<string, LogLevel> = {
        production: LogLevel.Info | LogLevel.Error,
        development: LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
    };

    private static currentEnv: string = import.meta.env.MODE;

    private static isLogLevelEnabled(level: LogLevel): boolean {
        const envMask = this.logLevels[this.currentEnv];

        return !!envMask && (level & envMask) === level.valueOf();
    }

    private static logMessage(level: LogLevel, message: string) {
        if (this.isLogLevelEnabled(level)) {
            console.log(`${this.colors[level]}[${LogLevel[level]}] ${message}`);
        }
    }

    static debug(message: string) {
        this.logMessage(LogLevel.Debug, message);
    }

    static info(message: string) {
        this.logMessage(LogLevel.Info, message);
    }

    static warn(message: string) {
        this.logMessage(LogLevel.Warn, message);
    }

    static error(message: string) {
        this.logMessage(LogLevel.Error, message);
    }
}
