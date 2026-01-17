import type {
  LogData,
  WideEventLogger,
  WideEventRecord,
  FlushableLogger,
} from "./types";
import { colors, formatTime, formatData } from "./formatter";

class RequestEventLogger implements WideEventLogger {
  private startTime: number;
  private fields: Map<string, LogData> = new Map();
  private errorData?: LogData;
  private headerTime: string;

  constructor(
    private requestId: string,
    private method: string,
    private path: string,
    private useJson: boolean,
  ) {
    this.startTime = Date.now();
    this.headerTime = formatTime();
  }

  set(key: string, data: LogData): void {
    this.fields.set(key, data);
  }

  error(error: LogData): void {
    this.errorData = error;
  }

  flush(status: number): void {
    const durationMs = Date.now() - this.startTime;

    if (this.useJson) {
      this.flushJson(status, durationMs);
    } else {
      this.flushDev(status, durationMs);
    }
  }

  private flushDev(status: number, durationMs: number): void {
    const statusColor = status >= 400 ? colors.red : colors.green;

    console.log(
      `\n${colors.dim}[${this.headerTime}]${colors.reset} ` +
        `${colors.yellow}${this.method} ${this.path}${colors.reset} ` +
        `${statusColor}${status}${colors.reset} ` +
        `${colors.dim}${durationMs}ms${colors.reset}`,
    );

    for (const [key, data] of this.fields) {
      console.log(`  ${colors.blue}${key}:${colors.reset} ${formatData(data)}`);
    }

    if (this.errorData) {
      console.log(`  ${colors.red}error:${colors.reset} ${formatData(this.errorData)}`);
    }
  }

  private flushJson(status: number, durationMs: number): void {
    const record: WideEventRecord = {
      timestamp: new Date().toISOString(),
      request_id: this.requestId,
      method: this.method,
      path: this.path,
      status,
      duration_ms: durationMs,
    };

    for (const [key, data] of this.fields) {
      record[key] = data;
    }

    if (this.errorData) {
      record.error = this.errorData;
      console.error(JSON.stringify(record));
    } else {
      console.log(JSON.stringify(record));
    }
  }
}

function createLogger(
  requestId: string,
  method: string,
  path: string,
  useJson: boolean,
): FlushableLogger {
  return new RequestEventLogger(requestId, method, path, useJson);
}

function logServerStart(
  serverUrl: string,
  userData: LogData,
  useJson: boolean,
): void {
  const time = formatTime();

  if (useJson) {
    const record = {
      timestamp: new Date().toISOString(),
      event: "server_start",
      url: serverUrl,
      ...userData,
    };
    console.log(JSON.stringify(record));
  } else {
    console.log(
      `\n${colors.dim}[${time}]${colors.reset} ` +
        `${colors.green}SERVER STARTED${colors.reset}`,
    );
    console.log(`  ${colors.blue}url:${colors.reset} ${serverUrl}`);
    for (const [key, value] of Object.entries(userData)) {
      console.log(`  ${colors.blue}${key}:${colors.reset} ${JSON.stringify(value)}`);
    }
  }
}

export { createLogger, logServerStart };
