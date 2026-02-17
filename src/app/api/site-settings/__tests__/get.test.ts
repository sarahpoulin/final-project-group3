/**
 * Tests for the `GET /api/site-settings` route handler.
 *
 * Verifies default ABOUT keys behavior, custom keys parsing, empty-key handling,
 * and mapping of results into a key -> value (or null) object.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { prisma } from "@/lib/db";

vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    siteSetting: {
      findMany: vi.fn(),
    },
  },
}));

const ABOUT_KEYS = [
  "about.pageTitle",
  "about.pageTagline",
  "about.ourStoryHeading",
  "about.ourStoryBody",
  "about.whatWeDo",
];

describe("GET /api/site-settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses default ABOUT keys when keys param is missing", async () => {
    (prisma.siteSetting.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      [
        { key: "about.pageTitle", value: "About Title" },
        { key: "about.ourStoryBody", value: "Our story body" },
      ],
    );

    const req = new Request("http://localhost/api/site-settings");
    const res = await GET(req);

    expect(prisma.siteSetting.findMany).toHaveBeenCalledWith({
      where: { key: { in: ABOUT_KEYS } },
      select: { key: true, value: true },
    });

    expect(res.status).toBe(200);
    const body = await res.json();

    // All ABOUT keys should be present
    expect(Object.keys(body).sort()).toEqual(ABOUT_KEYS.sort());
    expect(body["about.pageTitle"]).toBe("About Title");
    expect(body["about.ourStoryBody"]).toBe("Our story body");
    // Keys not returned by Prisma should be null
    expect(body["about.pageTagline"]).toBeNull();
    expect(body["about.ourStoryHeading"]).toBeNull();
    expect(body["about.whatWeDo"]).toBeNull();
  });

  it("parses custom keys query param and returns only those keys", async () => {
    (prisma.siteSetting.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      [
        { key: "foo", value: "1" },
        { key: "bar", value: "2" },
      ],
    );

    const req = new Request(
      "http://localhost/api/site-settings?keys=foo, bar ,baz,,",
    );
    const res = await GET(req);

    expect(prisma.siteSetting.findMany).toHaveBeenCalledWith({
      where: { key: { in: ["foo", "bar", "baz"] } },
      select: { key: true, value: true },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      foo: "1",
      bar: "2",
      baz: null,
    });
  });

  it("returns empty object and does not hit the database when keys parse to empty list", async () => {
    const req = new Request("http://localhost/api/site-settings?keys=,,");
    const res = await GET(req);

    expect(prisma.siteSetting.findMany).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({});
  });
});

