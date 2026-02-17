/**
 * @file About page tests.
 *
 * Verifies that the About page server component wires data correctly from
 * auth()/Prisma into the child components, parses the What We Do JSON value,
 * computes the isAdmin flag, and renders the Request a Quote call-to-action.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "./page";

const mockAuth = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    siteSetting: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

vi.mock("./about-hero", () => ({
  __esModule: true,
  default: ({ initialTitle, initialTagline, isAdmin }: { initialTitle: string | null; initialTagline: string | null; isAdmin: boolean }) => (
    <div
      data-testid="about-hero"
      data-title={initialTitle ?? ""}
      data-tagline={initialTagline ?? ""}
      data-admin={isAdmin ? "true" : "false"}
    />
  ),
}));

vi.mock("./story", () => ({
  __esModule: true,
  default: ({ initialHeading, initialBody, isAdmin }: { initialHeading: string | null; initialBody: string | null; isAdmin: boolean }) => (
    <div
      data-testid="about-story"
      data-heading={initialHeading ?? ""}
      data-body={initialBody ?? ""}
      data-admin={isAdmin ? "true" : "false"}
    />
  ),
}));

vi.mock("./what-we-do", () => ({
  __esModule: true,
  default: ({
    initialHeading,
    initialCards,
    isAdmin,
  }: {
    initialHeading: string | null;
    initialCards: { title: string; description: string }[] | null;
    isAdmin: boolean;
  }) => (
    <div
      data-testid="about-what-we-do"
      data-heading={initialHeading ?? ""}
      data-cards={JSON.stringify(initialCards)}
      data-admin={isAdmin ? "true" : "false"}
    />
  ),
}));

describe("About page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes site settings into child components and parses What We Do JSON", async () => {
    mockAuth.mockResolvedValue({
      user: { name: "Admin", isAdmin: true },
    });
    mockFindMany.mockResolvedValue([
      { key: "about.pageTitle", value: "About Title" },
      { key: "about.pageTagline", value: "About Tagline" },
      { key: "about.ourStoryHeading", value: "Our Story Heading" },
      { key: "about.ourStoryBody", value: "Our story body." },
      {
        key: "about.whatWeDo",
        value: JSON.stringify({
          heading: "What We Do Heading",
          cards: [{ title: "Card 1", description: "Card 1 description" }],
        }),
      },
    ]);

    render(await About());

    const hero = screen.getByTestId("about-hero");
    const story = screen.getByTestId("about-story");
    const whatWeDo = screen.getByTestId("about-what-we-do");

    expect(hero).toHaveAttribute("data-title", "About Title");
    expect(hero).toHaveAttribute("data-tagline", "About Tagline");
    expect(hero).toHaveAttribute("data-admin", "true");

    expect(story).toHaveAttribute("data-heading", "Our Story Heading");
    expect(story).toHaveAttribute("data-body", "Our story body.");
    expect(story).toHaveAttribute("data-admin", "true");

    expect(whatWeDo).toHaveAttribute("data-heading", "What We Do Heading");
    expect(whatWeDo).toHaveAttribute(
      "data-cards",
      JSON.stringify([{ title: "Card 1", description: "Card 1 description" }]),
    );
    expect(whatWeDo).toHaveAttribute("data-admin", "true");
  });

  it("treats user as non-admin when isAdmin flag is missing or falsey", async () => {
    mockAuth.mockResolvedValue({
      user: { name: "Regular User" },
    });
    mockFindMany.mockResolvedValue([]);

    render(await About());

    const hero = screen.getByTestId("about-hero");
    const story = screen.getByTestId("about-story");
    const whatWeDo = screen.getByTestId("about-what-we-do");

    expect(hero).toHaveAttribute("data-admin", "false");
    expect(story).toHaveAttribute("data-admin", "false");
    expect(whatWeDo).toHaveAttribute("data-admin", "false");
  });

  it("handles invalid or empty What We Do JSON by passing null heading and cards", async () => {
    mockAuth.mockResolvedValue({
      user: { name: "Admin", isAdmin: true },
    });
    mockFindMany.mockResolvedValue([
      { key: "about.whatWeDo", value: "not-json" },
    ]);

    render(await About());

    const whatWeDo = screen.getByTestId("about-what-we-do");
    expect(whatWeDo).toHaveAttribute("data-heading", "");
    expect(whatWeDo).toHaveAttribute("data-cards", "null");
  });

  it("renders the Request a Quote call-to-action linking to /contact", async () => {
    mockAuth.mockResolvedValue({ user: null });
    mockFindMany.mockResolvedValue([]);

    render(await About());

    const cta = screen.getByRole("link", { name: "Request a Quote" });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/contact");
  });
});

