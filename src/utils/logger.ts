export enum LogLevel {
    Debug = 1,
    Info = 2,
    Warn = 4,
    Error = 8,
}

const colors: Record<LogLevel, string> = {
    [LogLevel.Info]: "\x1b[32m",
    [LogLevel.Warn]: "\x1b[33m",
    [LogLevel.Error]: "\x1b[31m",
    [LogLevel.Debug]: "\x1b[37m",
};

const logLevels: Record<string, LogLevel> = {
    production: LogLevel.Info | LogLevel.Error,
    development: LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
};

const currentEnv: string = import.meta.env.MODE;

const isLogLevelEnabled = (level: LogLevel): boolean => {
    const envMask = logLevels[currentEnv];
    return !!envMask && (level & envMask) === level.valueOf();
};

const getCallerLocation = (): string => {
    const error = new Error();
    const stackLines = error.stack?.split("\n") ?? [];

    const callerLine = stackLines[3] ?? stackLines[2] ?? "";
    const match = (/at (.+) \((.+):(\d+):(\d+)\)/.exec(callerLine)) ?? (/at (.+):(\d+):(\d+)/.exec(callerLine));

    if (match) {
        if (match.length === 5) {
            const [, , file, line, column] = match;
            return `${file}:${line}:${column}`;
        }
        if (match.length === 4) {
            const [, file, line, column] = match;
            return `${file}:${line}:${column}`;
        }
    }

    return "unknown location";
};

const logMessage = (level: LogLevel, message: string) => {
    if (isLogLevelEnabled(level)) {
        const location = getCallerLocation();
        console.log(`${colors[level]}[${LogLevel[level]}] ${message} \x1b[90m(${location})\x1b[0m`);
    }
};

export const Logger = {
    debug: (message: string) => { logMessage(LogLevel.Debug, message); },
    info: (message: string) => { logMessage(LogLevel.Info, message); },
    warn: (message: string) => { logMessage(LogLevel.Warn, message); },
    error: (message: string) => { logMessage(LogLevel.Error, message); },
};
