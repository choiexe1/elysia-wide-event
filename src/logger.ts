import type {
  LogData,
  ErrorData,
  WideEventLogger,
  WideEventRecord,
  FlushableLogger,
} from "./types";
import { colors, formatTime, formatData } from "./formatter";

export class RequestEventLogger implements WideEventLogger {
  private startTime: number;
  private fields: Map<string, LogData> = new Map();
  private errorData?: ErrorData;
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

  error(error: ErrorData): void {
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
      const errorMsg = this.errorData.message
        ? `${this.errorData.type}: ${this.errorData.message}`
        : this.errorData.type;
      console.log(`  ${colors.red}✗${colors.reset} ${errorMsg}`);
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

export function createLogger(
  requestId: string,
  method: string,
  path: string,
  useJson: boolean,
): FlushableLogger {
  return new RequestEventLogger(requestId, method, path, useJson);
}
