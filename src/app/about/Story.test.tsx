/**
 * @file Story component tests.
 *
 * Verifies that the Story component renders correctly and displays
 * the expected content: heading and paragraph text. Also covers the
 * admin editing workflow (Edit -> Save / Cancel) and paragraph
 * formatting edge cases when splitting on blank lines.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Story from "./story";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = mockFetch;

describe("Story", () => {
  const defaultProps = {
    initialHeading: null as string | null,
    initialBody: null as string | null,
    isAdmin: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it("renders the Our Story heading", () => {
    render(<Story {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "Our Story" })).toBeInTheDocument();
  });

  it("displays placeholder when no story content is set", () => {
    render(<Story {...defaultProps} />);
    expect(
      screen.getByText("This is where you add your story."),
    ).toBeInTheDocument();
  });

  it("displays content from the database when initialBody is provided", () => {
    const bodyFromDb =
      "Shoreline Woodworks is a family-run woodworking studio based in Halifax, Nova Scotia.\n\nWe believe in building lasting relationships with our clients.";
    render(
      <Story
        {...defaultProps}
        initialHeading="Our Story"
        initialBody={bodyFromDb}
      />,
    );
    expect(
      screen.getByText(
        /Shoreline Woodworks is a family-run woodworking studio based in Halifax, Nova Scotia/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /We believe in building lasting relationships with our clients/,
      ),
    ).toBeInTheDocument();
  });

  it("shows Edit button only when isAdmin is true", () => {
    const { rerender } = render(<Story {...defaultProps} isAdmin={false} />);

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    rerender(<Story {...defaultProps} isAdmin />);

    expect(
      screen.getByRole("button", { name: "Edit" }),
    ).toBeInTheDocument();
  });

  it("enters edit mode and renders textarea with current body", async () => {
    const user = userEvent.setup();

    render(<Story {...defaultProps} isAdmin />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const textarea = screen.getByLabelText("Our Story body");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue("This is where you add your story.");
  });

  it("saves updated heading and body and calls the site settings API and router.refresh", async () => {
    const user = userEvent.setup();

    render(
      <Story
        {...defaultProps}
        initialHeading="Our Story"
        initialBody="First paragraph."
        isAdmin
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const headingInput = screen.getByLabelText("Our Story heading");
    const bodyTextarea = screen.getByLabelText("Our Story body");

    await user.clear(headingInput);
    await user.type(headingInput, "Updated Story Heading");
    await user.clear(bodyTextarea);
    await user.type(
      bodyTextarea,
      "Updated paragraph one.\n\nUpdated paragraph two.",
    );

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
        { key: "about.ourStoryHeading", value: "Updated Story Heading" },
        {
          key: "about.ourStoryBody",
          value: "Updated paragraph one.\n\nUpdated paragraph two.",
        },
      ]),
    );
  });

  it("cancels edits and returns to view mode without saving", async () => {
    const user = userEvent.setup();

    render(
      <Story
        {...defaultProps}
        initialHeading="Custom Heading"
        initialBody="Custom body content."
        isAdmin
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const headingInput = screen.getByLabelText("Our Story heading");
    await user.clear(headingInput);
    await user.type(headingInput, "Changed but not saved");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("heading", { name: "Custom Heading" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Our Story heading"),
    ).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("splits body into paragraphs on blank lines and normalizes inner newlines to spaces", () => {
    const body =
      "Line one of paragraph one.\nLine two of paragraph one.\n\nLine one of paragraph two.";

    render(
      <Story
        {...defaultProps}
        initialHeading="Our Story"
        initialBody={body}
      />,
    );

    // First paragraph lines joined with spaces
    expect(
      screen.getByText(
        "Line one of paragraph one. Line two of paragraph one.",
      ),
    ).toBeInTheDocument();
    // Second paragraph rendered separately
    expect(
      screen.getByText("Line one of paragraph two."),
    ).toBeInTheDocument();
  });
});
