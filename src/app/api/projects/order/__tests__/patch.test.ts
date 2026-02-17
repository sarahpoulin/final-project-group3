/**
 * @vitest-environment node
 * Tests for the `PATCH /api/projects/order` route handler.
 *
 * Verifies that the admin-only reorder endpoint validates input, groups projects
 * by calendar day, calls Prisma with the correct ids, and handles errors.
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
    project: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (operations: unknown[]) => operations),
  },
}));

describe("PATCH /api/projects/order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the auth guard response when requireAdmin fails", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    });

    const req = new Request("http://localhost/api/projects/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: ["a", "b"] }),
    });

    const res = await PATCH(req);

    expect(requireAdmin).toHaveBeenCalled();
    expect(prisma.project.findMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
  });

  it("returns 400 when orderedIds is missing, not an array, or empty", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    const cases = [
      {},
      { orderedIds: "not-an-array" },
      { orderedIds: [] },
    ];

    for (const body of cases) {
      const req = new Request("http://localhost/api/projects/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toHaveProperty(
        "error",
        "orderedIds must be a non-empty array of project IDs",
      );
    }
  });

  it("returns 400 when all ids are filtered out as invalid", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    const req = new Request("http://localhost/api/projects/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: [" ", 1, null] }),
    });

    const res = await PATCH(req);

    expect(prisma.project.findMany).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "orderedIds must contain at least one valid project ID",
    });
  });

  it("reorders existing projects by day and calls Prisma with updated timestamps", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    const day1 = new Date("2024-01-01T10:00:00Z");
    const day2 = new Date("2024-01-02T12:00:00Z");

    const projects = [
      { id: "a", createdAt: day1 },
      { id: "b", createdAt: day1 },
      { id: "c", createdAt: day2 },
    ];

    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      projects,
    );

    const req = new Request("http://localhost/api/projects/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderedIds: ["c", "a", "b", "non-existent"],
      }),
    });

    const res = await PATCH(req);

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["c", "a", "b", "non-existent"] } },
      select: { id: true, createdAt: true },
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    // We don't assert exact timestamps, but ensure one update per existing id
    // with Date instances and the expected ordering.
    const updateCalls = (prisma.project.update as unknown as ReturnType<typeof vi.fn>).mock
      .calls;
    expect(updateCalls).toHaveLength(3);

    const updatedIds = updateCalls.map(([args]) => (args as { where: { id: string } }).where.id);
    expect(updatedIds).toEqual(["c", "a", "b"]);

    updateCalls.forEach(([args]) => {
      const createdAt = (args as { data: { createdAt: Date } }).data.createdAt;
      expect(createdAt).toBeInstanceOf(Date);
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it("returns 500 when the database operation throws", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      response: null,
    });

    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("DB error"),
    );

    const req = new Request("http://localhost/api/projects/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: ["a"] }),
    });

    const res = await PATCH(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: "Failed to update project order",
    });
  });
});

