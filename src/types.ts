export interface LogData {
  [key: string]: unknown;
}

export interface ErrorData {
  type: string;
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export interface WideEventLogger {
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
   * Output format: true for JSON, false for pretty colored output
   * @default false
   */
  json?: boolean;
}

export interface WideEventRecord {
  timestamp: string;
  request_id: string;
  method: string;
  path: string;
  status?: number;
  duration_ms?: number;
  error?: ErrorData;
  [key: string]: unknown;
}

export type FlushableLogger = WideEventLogger & {
  flush: (status: number) => void;
};
