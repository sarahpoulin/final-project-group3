/**
 * @file AboutHero component tests.
 *
 * Verifies that the AboutHero component renders default content, shows the Edit
 * controls only for admins, and that the edit flow correctly saves updated
 * values via the site settings API and triggers a router refresh.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AboutHero from "./about-hero";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = mockFetch;

describe("AboutHero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it("renders default title and tagline when no initial content is provided", () => {
    render(<AboutHero initialTitle={null} initialTagline={null} isAdmin={false} />);

    expect(
      screen.getByRole("heading", { name: "About Shoreline Woodworks" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Learn all about us — our craft, materials, and services.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });

  it("shows the Edit button only when the user is an admin", () => {
    const { rerender } = render(
      <AboutHero initialTitle={null} initialTagline={null} isAdmin={false} />,
    );

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    rerender(<AboutHero initialTitle={null} initialTagline={null} isAdmin />);

    expect(
      screen.getByRole("button", { name: "Edit" }),
    ).toBeInTheDocument();
  });

  it("enters edit mode when clicking Edit and shows inputs with current values", async () => {
    const user = userEvent.setup();

    render(
      <AboutHero
        initialTitle="Custom Title"
        initialTagline="Custom Tagline"
        isAdmin
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByLabelText("Page title");
    const taglineInput = screen.getByLabelText("Tagline");

    expect(titleInput).toHaveValue("Custom Title");
    expect(taglineInput).toHaveValue("Custom Tagline");
  });

  it("saves updated title and tagline and calls the site settings API and router.refresh", async () => {
    const user = userEvent.setup();

    render(<AboutHero initialTitle={null} initialTagline={null} isAdmin />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByLabelText("Page title");
    const taglineInput = screen.getByLabelText("Tagline");

    await user.clear(titleInput);
    await user.type(titleInput, "New About Title");
    await user.clear(taglineInput);
    await user.type(taglineInput, "New About Tagline");

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockRefresh).toHaveBeenCalled();
    });

    const payloads = mockFetch.mock.calls.map(([, options]) =>
      JSON.parse((options as RequestInit).body as string),
    );

    expect(payloads).toEqual(
      expect.arrayContaining([
        { key: "about.pageTitle", value: "New About Title" },
        { key: "about.pageTagline", value: "New About Tagline" },
      ]),
    );
  });

  it("cancels edits and returns to view mode without saving when Cancel is clicked", async () => {
    const user = userEvent.setup();

    render(<AboutHero initialTitle={null} initialTagline={null} isAdmin />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByLabelText("Page title");
    await user.clear(titleInput);
    await user.type(titleInput, "Changed but not saved");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("heading", { name: "About Shoreline Woodworks" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Page title"),
    ).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

