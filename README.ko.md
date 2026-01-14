# elysia-wide-event

[![npm version](https://img.shields.io/npm/v/elysia-wide-event.svg)](https://www.npmjs.com/package/elysia-wide-event)
[![license](https://img.shields.io/npm/l/elysia-wide-event.svg)](https://github.com/choiexe1/elysia-wide-event/blob/main/LICENSE)

[Elysia](https://elysiajs.com)를 위한 Wide Event 로깅 플러그인. 요청의 모든 컨텍스트를 하나의 구조화된 로그 라인으로 집계하여 관측성을 높입니다.

[Logging Sucks](https://loggingsucks.com/)에서 영감을 받았습니다 - 디버깅을 즐겁게 만드는 Wide Event 패턴.

> **Bun + Elysia 전용.** 이 플러그인은 Bun 런타임과 Elysia 프레임워크 전용으로 설계되었습니다. Node.js는 지원하지 않습니다.

## 기능

- **컨텍스트 수집**: `wideEvent.set()`으로 요청 생명주기 전반에 걸쳐 데이터 수집
- **환경 인식**: 개발 환경에서는 컬러 출력, 프로덕션에서는 JSON
- **Request ID**: `x-request-id` 헤더에서 추출하거나 자동 생성
- **성능 측정**: 요청 처리 시간 자동 추적

## 설치

```bash
bun add elysia-wide-event
```

## 빠른 시작

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

## 출력

### 개발 환경

```
[14:23:01] POST /users 201 45ms
  user: email="test@example.com"
  result: userId="abc-123"
```

### 프로덕션 (`NODE_ENV=production`)

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

## 옵션

```typescript
wideEvent({
  generateRequestId: () => crypto.randomUUID(),
  requestIdHeader: "x-request-id",
  forceJson: false,
});
```

| 옵션                | 타입           | 기본값              | 설명                           |
| ------------------- | -------------- | ------------------- | ------------------------------ |
| `generateRequestId` | `() => string` | `crypto.randomUUID` | 커스텀 Request ID 생성기       |
| `requestIdHeader`   | `string`       | `"x-request-id"`    | Request ID를 가져올 헤더       |
| `forceJson`         | `boolean`      | `false`             | 개발 환경에서도 JSON 출력 강제 |

## API

### `wideEvent.set(key, data)`

현재 요청 로그에 컨텍스트 추가.

```typescript
wideEvent.set("auth", { userId: "123", role: "admin" });
```

### `wideEvent.error({ type, message })`

에러 상세 정보 로깅.

```typescript
wideEvent.error({ type: "ValidationError", message: "Invalid email" });
```

## 요구사항

- Bun >= 1.0.0
- Elysia >= 1.0.0

## 라이선스

MIT
