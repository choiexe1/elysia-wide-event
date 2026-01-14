import { Elysia } from "elysia";
import { wideEvent } from "../src";

const app = new Elysia()
  .use(wideEvent({}))
  .post("/users", ({ wideEvent, body }) => {
    wideEvent.set("user", { email: (body as { email: string }).email });

    const userId = crypto.randomUUID();
    wideEvent.set("result", { userId });

    return { success: true, userId };
  })
  .get("/users/:id", ({ wideEvent, params }) => {
    wideEvent.set("params", { id: params.id });

    return { id: params.id, name: "John Doe", email: "john@example.com" };
  })
  .post("/login", ({ wideEvent, body, set }) => {
    const { email, password } = body as { email: string; password: string };
    wideEvent.set("auth", { email });

    if (password !== "secret") {
      set.status = 401;
      wideEvent.error({ type: "AuthError", message: "Invalid credentials" });
      return { success: false };
    }

    wideEvent.set("result", { token: "jwt-token-here" });
    return { success: true, token: "jwt-token-here" };
  })
  .listen(3000);

console.log("Example app running at http://localhost:3000");
console.log("\nTry these commands:");
console.log(
  '  curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d \'{"email":"test@example.com"}\'',
);
console.log("  curl http://localhost:3000/users/123");
console.log(
  '  curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d \'{"email":"admin@example.com","password":"wrong"}\'',
);
