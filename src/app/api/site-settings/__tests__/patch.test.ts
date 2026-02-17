/**
 * Tests for the `PATCH /api/site-settings` route handler.
 *
 * Verifies admin guard behavior, JSON/body validation, key validation, and
 * Prisma upsert logic for site settings.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "../route";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";

vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    siteSetting: {
      upsert: vi.fn(),
    },
  },
}));

describe("PATCH /api/site-settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the auth guard response when requireAdmin fails", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    });

    const req = new Request("http://localhost/api/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "about.pageTitle", value: "Title" }),
    });

    const res = await PATCH(req);

    expect(requireAdmin).toHaveBeenCalled();
    expect(prisma.siteSetting.upsert).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 when JSON body is invalid", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    // Simulate a Request whose json() throws
    const badReq = {
      json: async () => {
        throw new Error("invalid json");
      },
    } as unknown as Request;

    const res = await PATCH(badReq);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
    expect(prisma.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it("returns 400 when key is missing or invalid", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    const cases = [
      {},
      { key: 123 },
      { key: "   " },
    ];

    for (const body of cases) {
      const req = new Request("http://localhost/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await PATCH(req);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Missing or invalid key" });
    }

    expect(prisma.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it("upserts setting with provided key and value", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    (prisma.siteSetting.upsert as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {},
    );

    const req = new Request("http://localhost/api/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "about.pageTitle",
        value: "New Title",
      }),
    });

    const res = await PATCH(req);

    expect(prisma.siteSetting.upsert).toHaveBeenCalledWith({
      where: { key: "about.pageTitle" },
      create: { key: "about.pageTitle", value: "New Title" },
      update: { value: "New Title" },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("stores empty string when value is missing or null", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    (prisma.siteSetting.upsert as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {},
    );

    const bodies = [
      { key: "about.pageTagline" },
      { key: "about.pageTagline", value: null },
    ];

    for (const body of bodies) {
      (prisma.siteSetting.upsert as unknown as ReturnType<typeof vi.fn>).mockClear();

      const req = new Request("http://localhost/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await PATCH(req);

      expect(prisma.siteSetting.upsert).toHaveBeenCalledWith({
        where: { key: "about.pageTagline" },
        create: { key: "about.pageTagline", value: "" },
        update: { value: "" },
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    }
  });
});

