import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSameOrigin } from "../src/lib/http";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("same-origin validation", () => {
  it("allows both configured local development origins", () => {
    vi.stubEnv("APP_URLS", "http://localhost:3000,https://localhost:3443");

    expect(assertSameOrigin(new Request("http://localhost:3000/api", {
      headers: { origin: "http://localhost:3000" }
    }))).toBe(true);
    expect(assertSameOrigin(new Request("https://localhost:3443/api", {
      headers: { origin: "https://localhost:3443" }
    }))).toBe(true);
  });

  it("rejects origins not explicitly configured", () => {
    vi.stubEnv("APP_URLS", "http://localhost:3000,https://localhost:3443");

    expect(assertSameOrigin(new Request("http://localhost:3000/api", {
      headers: { origin: "https://example.com" }
    }))).toBe(false);
  });

  it("keeps the single APP_URL production configuration compatible", () => {
    vi.stubEnv("APP_URLS", undefined);
    vi.stubEnv("APP_URL", "https://atelier-noir.example");

    expect(assertSameOrigin(new Request("https://atelier-noir.example/api", {
      headers: { origin: "https://atelier-noir.example" }
    }))).toBe(true);
    expect(assertSameOrigin(new Request("https://atelier-noir.example/api", {
      headers: { origin: "https://other.example" }
    }))).toBe(false);
  });
});
