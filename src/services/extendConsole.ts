import chalk from "chalk";

type LogLevel = "error" | "warn" | "log" | "info" | "debug" | "verbose"

const settings = {
    logLevel: parseInt(process.env.LOG_LEVEL || "") || 5,
    timestamps: true,
    colors: {
        error: chalk.redBright,
        warn: chalk.yellowBright,
        log: chalk.gray,
        info: chalk.whiteBright,
        debug: chalk.blue,
        verbose: chalk.greenBright,
    },
};

const defaultLog = console.log;

function generatePrefix(level: LogLevel): string {
    const timestamp = settings.timestamps
        ? chalk.gray(`[${new Date(Date.now()).toLocaleTimeString([], { hour12: false })}] `)
        : "";

    return `${timestamp}${chalk.gray(`[`)}${(settings.colors[level]).bold(`${level}`)}${chalk.gray(`]`)}`.padEnd(21, " ");
}

function error(...message: any[]): void {
    if (settings.logLevel >= 0)
        defaultLog(generatePrefix("error"), ...message);
}

function warn(...message: any[]): void {
    if (settings.logLevel >= 1)
        defaultLog(generatePrefix("warn"), ...message);
}

function log(...message: any[]): void {
    if (settings.logLevel >= 2)
        defaultLog(generatePrefix("log"), ...message);
}

function info(...message: any[]): void {
    if (settings.logLevel >= 3)
        defaultLog(generatePrefix("info"), ...message);
}

function debug(...message: any[]): void {
    if (settings.logLevel >= 4)
        defaultLog(generatePrefix("debug"), ...message);
}

function verbose(...message: any[]): void {
    if (settings.logLevel >= 5)
        defaultLog(generatePrefix("verbose"), ...message);
}

console.log = log;
console.info = info;
console.warn = warn;
console.error = error;
console.debug = debug;
console.verbose = verbose;
