import type { LogData } from "./types";

export const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
} as const;

export function formatTime(): string {
  return new Date().toISOString().slice(11, 19);
}

export function formatData(data: LogData): string {
  return Object.entries(data)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(" ");
}

export function isProduction(): boolean {
  return process.env["NODE_ENV"] === "production";
}
