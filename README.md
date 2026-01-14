# elysia-wide-event

[![npm version](https://img.shields.io/npm/v/elysia-wide-event.svg)](https://www.npmjs.com/package/elysia-wide-event)
[![license](https://img.shields.io/npm/l/elysia-wide-event.svg)](https://github.com/code-yeongyu/elysia-wide-event/blob/main/LICENSE)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![Elysia](https://img.shields.io/badge/Elysia-black?logo=elysia)](https://elysiajs.com)

Wide event logging plugin for Elysia. Aggregates all request context into a single structured log line for better observability.

## Features

- **Context Accumulation**: Collect data throughout request lifecycle via `event.set()`
- **Environment Aware**: Colored output in development, JSON in production
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

### Development

```
[14:23:01] POST /users 201 45ms
  user: email="test@example.com"
  result: userId="abc-123"
```

### Production (`NODE_ENV=production`)

```json
{
  "timestamp": "2024-01-14T14:23:01.000Z",
  "request_id": "8b3f4d...",
  "method": "POST",
  "path": "/users",
  "status": 201,
  "duration_ms": 45,
  "user": { "email": "test@example.com" },
  "result": { "userId": "abc-123" }
}
```

## Options

```typescript
wideEvent({
  generateRequestId: () => crypto.randomUUID(),
  requestIdHeader: "x-request-id",
  forceJson: false,
});
```

| Option              | Type           | Default             | Description                      |
| ------------------- | -------------- | ------------------- | -------------------------------- |
| `generateRequestId` | `() => string` | `crypto.randomUUID` | Custom request ID generator      |
| `requestIdHeader`   | `string`       | `"x-request-id"`    | Header for incoming request ID   |
| `forceJson`         | `boolean`      | `false`             | Force JSON output in development |

## API

### `wideEvent.set(key, data)`

Add context to the current request log.

```typescript
wideEvent.set("auth", { userId: "123", role: "admin" });
```

### `wideEvent.error({ type, message })`

Log error details.

```typescript
wideEvent.error({ type: "ValidationError", message: "Invalid email" });
```

## License

MIT
