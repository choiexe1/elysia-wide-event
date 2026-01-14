import { Elysia } from "elysia";

export interface LogData {
  [key: string]: unknown;
}

export interface ErrorData {
  type: string;
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface EventLogger {
  set: (key: string, data: LogData) => void;
  error: (error: ErrorData) => void;
}

export interface WideEventOptions {
  /**
   * Custom request ID generator
   * @default crypto.randomUUID()
   */
  generateRequestId?: () => string;

  /**
   * Request ID header name to use from incoming request
   * @default "x-request-id"
   */
  requestIdHeader?: string;

  /**
   * Force JSON output regardless of NODE_ENV
   * @default false (uses pretty format in development)
   */
  forceJson?: boolean;
}

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function formatTime(): string {
  return new Date().toISOString().slice(11, 19);
}

function formatData(data: LogData): string {
  return Object.entries(data)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(" ");
}

interface WideEvent {
  timestamp: string;
  request_id: string;
  method: string;
  path: string;
  status?: number;
  duration_ms?: number;
  error?: ErrorData;
  [key: string]: unknown;
}

class RequestEventLogger implements EventLogger {
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

  set(key: string, data: LogData) {
    this.fields.set(key, data);
  }

  error(error: ErrorData) {
    this.errorData = error;
  }

  flush(status: number) {
    const durationMs = Date.now() - this.startTime;

    if (this.useJson) {
      this.flushJson(status, durationMs);
    } else {
      this.flushDev(status, durationMs);
    }
  }

  private flushDev(status: number, durationMs: number) {
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

  private flushJson(status: number, durationMs: number) {
    const event: WideEvent = {
      timestamp: new Date().toISOString(),
      request_id: this.requestId,
      method: this.method,
      path: this.path,
      status,
      duration_ms: durationMs,
    };

    for (const [key, data] of this.fields) {
      event[key] = data;
    }

    if (this.errorData) {
      event.error = this.errorData;
      console.error(JSON.stringify(event));
    } else {
      console.log(JSON.stringify(event));
    }
  }
}

type FlushableEventLogger = EventLogger & { flush: (status: number) => void };

export const wideEvent = (options: WideEventOptions = {}) => {
  const {
    generateRequestId = () => crypto.randomUUID(),
    requestIdHeader = "x-request-id",
    forceJson = false,
  } = options;

  const useJson = forceJson || process.env.NODE_ENV === "production";

  return new Elysia({ name: "elysia-wide-event" })
    .derive({ as: "global" }, (ctx) => {
      const requestId =
        ctx.request.headers.get(requestIdHeader) ?? generateRequestId();
      const method = ctx.request.method;
      const path = new URL(ctx.request.url).pathname;
      const wideEvent: FlushableEventLogger = new RequestEventLogger(
        requestId,
        method,
        path,
        useJson,
      );
      return { wideEvent, requestId };
    })
    .onAfterResponse({ as: "global" }, ({ wideEvent, set }) => {
      if (!wideEvent) return;
      const status = typeof set.status === "number" ? set.status : 200;
      (wideEvent as FlushableEventLogger).flush(status);
    });
};

export default wideEvent;
