type LogLevel = "error" | "warn" | "info" | "debug";

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = (process.env.LOG_LEVEL || level) as LogLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.formatTimestamp();
    const levelUpper = level.toUpperCase();

    let colorCode = "";
    switch (level) {
      case "error":
        colorCode = COLORS.red;
        break;
      case "warn":
        colorCode = COLORS.yellow;
        break;
      case "info":
        colorCode = COLORS.green;
        break;
      case "debug":
        colorCode = COLORS.gray;
        break;
    }

    let output = `${colorCode}[${timestamp}] [${levelUpper}]${COLORS.reset} ${message}`;

    if (data) {
      try {
        output += ` ${JSON.stringify(data, null, 2)}`;
      } catch (err) {
        output += ` ${data.toString()}`;
      }
    }

    return output;
  }

  error(message: string, error?: any): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message, error));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog("warn")) {
      console.warn(this.format("warn", message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog("info")) {
      console.log(this.format("info", message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog("debug")) {
      console.log(this.format("debug", message, data));
    }
  }
}

export default new Logger();
