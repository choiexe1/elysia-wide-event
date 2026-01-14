import { Elysia } from "elysia";
import type { WideEventOptions, FlushableLogger } from "./types";
import { createLogger } from "./logger";
import { isProduction } from "./formatter";

export type {
  LogData,
  ErrorData,
  WideEventLogger,
  WideEventOptions,
} from "./types";

export const wideEvent = (options: WideEventOptions = {}) => {
  const {
    generateRequestId = () => crypto.randomUUID(),
    requestIdHeader = "x-request-id",
    forceJson = false,
  } = options;

  return new Elysia({ name: "elysia-wide-event" })
    .derive({ as: "global" }, (ctx) => {
      const requestId =
        ctx.request.headers.get(requestIdHeader) ?? generateRequestId();
      const method = ctx.request.method;
      const path = new URL(ctx.request.url).pathname;
      const useJson = forceJson || isProduction();
      const wideEvent: FlushableLogger = createLogger(
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
      (wideEvent as FlushableLogger).flush(status);
    });
};

export default wideEvent;
