export interface LogData {
  [key: string]: unknown;
}



export interface WideEventLogger {
  set: (key: string, data: LogData) => void;
  error: (error: LogData) => void;
}

export interface WideEventOptions {
  /**
   * Custom request ID generator.
   * @default crypto.randomUUID()
   * @example
   * ```ts
   * wideEvent({
   *   generateRequestId: () => `req-${Date.now()}`
   * })
   * ```
   */
  generateRequestId?: () => string;

  /**
   * Header name for incoming request ID.
   * @default "x-request-id"
   * @example
   * ```ts
   * wideEvent({
   *   requestIdHeader: "x-correlation-id"
   * })
   * ```
   */
  requestIdHeader?: string;

  /**
   * Output as JSON instead of pretty colored format.
   * @default false
   * @example
   * ```ts
   * wideEvent({
   *   json: true
   * })
   * ```
   */
  json?: boolean;

  /**
   * Custom data to log on server startup. Server URL is auto-included.
   * @example
   * ```ts
   * wideEvent({
   *   start: { env: "production", version: "1.0.0" }
   * })
   * ```
   */
  start?: LogData;
}

export interface WideEventRecord {
  timestamp: string;
  request_id: string;
  method: string;
  path: string;
  status?: number;
  duration_ms?: number;
  error?: LogData;
  [key: string]: unknown;
}

export type FlushableLogger = WideEventLogger & {
  flush: (status: number) => void;
};
