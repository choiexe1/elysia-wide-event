# elysia-wide-event

[![license](https://img.shields.io/github/license/choiexe1/elysia-wide-event)](./LICENSE)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logo=bun&logoColor=white)](https://bun.sh)
[![한국어](https://img.shields.io/badge/lang-한국어-blue.svg)](./docs/README.ko.md)

Wide event logging plugin for [Elysia](https://elysiajs.com). Aggregates all request context into a single structured log line for better observability.

Inspired by [Logging Sucks](https://loggingsucks.com/) - the wide event pattern that makes debugging actually enjoyable.

![elysia-wide-event output](./images/image.png)

> **Bun + Elysia only.** This plugin is designed specifically for the Bun runtime and Elysia framework. Node.js is not supported.

## Features

- **Server Start Log**: Log custom data on server startup with `start` option
- **Context Accumulation**: Collect data throughout request lifecycle via `wideEvent.set()`
- **Flexible Output**: Pretty colored output or JSON - you choose
- **Request ID**: Auto-generates or extracts from `x-request-id` header
- **Performance Metrics**: Automatic request duration tracking

## Installation

```bash
bun add elysia-wide-event
```

## Quick Start

```typescript
import { Elysia } from "elysia";
import { wideEvent } from "elysia-wide-event";

const app = new Elysia()
  .use(wideEvent())
  .post("/users", ({ wideEvent, body }) => {
    wideEvent.set("user", { email: body.email });

    const userId = "abc-123";
    wideEvent.set("result", { userId });

    return { success: true };
  })
  .listen(3000);
```

## Output

See the screenshot above for output examples. Pretty colored output by default, JSON with `json: true` option.

## Options

```typescript
wideEvent({
  generateRequestId: () => crypto.randomUUID(),
  requestIdHeader: "x-request-id",
  json: false,
  start: { env: "production", version: "1.0.0" },
});
```

| Option              | Type           | Default             | Description                                           |
| ------------------- | -------------- | ------------------- | ----------------------------------------------------- |
| `generateRequestId` | `() => string` | `crypto.randomUUID` | Custom request ID generator                           |
| `requestIdHeader`   | `string`       | `"x-request-id"`    | Header for incoming request ID                        |
| `json`              | `boolean`      | `false`             | Output as JSON instead of pretty format               |
| `start`             | `LogData`      | `undefined`         | Custom data to log on server startup (URL auto-added) |

## API

### `wideEvent.set(key, data)`

Add context to the current request log.

```typescript
wideEvent.set("auth", { userId: "123", role: "admin" });
```

### `wideEvent.error(data)`

Log error details. Accepts any object.

```typescript
wideEvent.error({ type: "ValidationError", message: "Invalid email" });
wideEvent.error({ code: "E001", reason: "timeout" });
```

## Requirements

- Bun >= 1.0.0
- Elysia >= 1.0.0

## License

MIT
