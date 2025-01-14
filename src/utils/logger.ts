export class Logger {
    private static logColor = '\x1b[34m';
    private static infoColor = '\x1b[32m';
    private static warnColor = '\x1b[33m';
    private static errorColor = '\x1b[31m';
    private static resetColor = '\x1b[0m';

    static log(message: string) {
        console.log(`${this.logColor}[LOG]${this.resetColor} ${message}`);
    }

    static info(message: string) {
        console.log(`${this.infoColor}[INFO]${this.resetColor} ${message}`);
    }

    static warn(message: string) {
        console.log(`${this.warnColor}[WARN]${this.resetColor} ${message}`);
    }

    static error(message: string) {
        console.log(`${this.errorColor}[ERROR]${this.resetColor} ${message}`);
    }
}
