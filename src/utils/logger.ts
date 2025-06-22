export enum LogLevel {
	Debug = 1,
	Info = 2,
	Warn = 4,
	Error = 8,
}

const LEVEL_STYLES: Record<LogLevel, string> = {
	[LogLevel.Debug]: "color: #bbb; font-weight: normal",
	[LogLevel.Info]: "color: #43B581; font-weight: bold",
	[LogLevel.Warn]: "color: #FAA61A; font-weight: bold",
	[LogLevel.Error]: "color: #F04747; font-weight: bold",
};

const ENV_MASK: Record<string, number> = {
	production: LogLevel.Info | LogLevel.Error,
	development: LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
};

const currentMask = ENV_MASK[import.meta.env.MODE] || 0;

function isEnabled(level: LogLevel): boolean {
	return !!currentMask && (level & currentMask) === level;
}

// function getCallerLocation(): string {
// 	const stack = new Error().stack?.split("\n") ?? [];
// 	const line = stack[3] ?? stack[2] ?? "";
// 	const m =
// 		/at .+\((.+):(\d+):(\d+)\)/.exec(line) ?? /at (.+):(\d+):(\d+)/.exec(line);
// 	if (m) {
// 		const file = m[1].split("/").pop();
// 		const row = m[2];
// 		const col = m[3];
// 		return `${file}:${row}:${col}`;
// 	}
// 	return "unknown";
// }

function log(
	level: LogLevel,
	method: "debug" | "info" | "warn" | "error",
	message: string,
	...args: string[]
) {
	if (!isEnabled(level)) return;

	const tag = `[${LogLevel[level]}]`;
	// const loc = `(${getCallerLocation()})`;

	const pattern = `%c${tag}%c ${message}%c`;

	const styleTag = LEVEL_STYLES[level] || "";
	const styleMsg = "color: inherit";
	const styleLoc = "color: #888; font-size: 0.9em";

	console[method](pattern, styleTag, styleMsg, styleLoc, ...args);
}

export const Logger = {
	debug: (msg: string, ...args: string[]) => {
		log(LogLevel.Debug, "debug", msg, ...args);
	},
	info: (msg: string, ...args: string[]) => {
		log(LogLevel.Info, "info", msg, ...args);
	},
	warn: (msg: string, ...args: string[]) => {
		log(LogLevel.Warn, "warn", msg, ...args);
	},
	error: (msg: string, ...args: string[]) => {
		log(LogLevel.Error, "error", msg, ...args);
	},

	header: (text: string) => {
		console.log(
			`%c ${text} `,
			`
            font-size: 50px;
            font-weight: 900;
            color: #fff;
            background: #5865F2;
            border: 2px solid #404EED;
            border-radius: 6px;
            padding: 8px 16px;
            text-shadow:
              -2px -2px 0 #000,
               2px -2px 0 #000,
              -2px  2px 0 #000,
               2px  2px 0 #000;
        `,
		);
	},

	group: (label: string, level: LogLevel = LogLevel.Debug) => {
		const tag = `[${LogLevel[level]}]`;
		const style = LEVEL_STYLES[level] || "";
		console.group(`%c${tag}%c ${label}`, style, "color: inherit");
	},

	groupEnd: () => {
		console.groupEnd();
	},
};
