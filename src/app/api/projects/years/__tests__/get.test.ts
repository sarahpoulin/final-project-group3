/**
 * Tests for the `GET /api/projects/years` route handler.
 *
 * Verifies that the handler extracts distinct years from project createdAt
 * values, sorts them descending, and handles database errors.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { prisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/projects/years", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns distinct years sorted descending from project createdAt", async () => {
    const projects = [
      { createdAt: new Date("2026-05-01T10:00:00Z") },
      { createdAt: new Date("2026-01-15T00:00:00Z") },
      { createdAt: new Date("2024-12-31T23:59:59Z") },
    ];

    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      projects,
    );

    const res = await GET();

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([2026, 2024]);
  });

  it("returns an empty array when there are no projects", async () => {
    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns 500 when the database query fails", async () => {
    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Database error"),
    );

    const res = await GET();

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Failed to fetch years" });
  });
});

