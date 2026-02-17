/**
 * @file WhatWeDo component tests.
 *
 * Verifies that the WhatWeDo component renders correctly and displays
 * all expected service cards with their headings and descriptions. Also
 * covers admin edit mode (Edit -> Save / Cancel) and the behavior when
 * initial heading/cards are provided from the database.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WhatWeDo from "./what-we-do";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = mockFetch;

describe("WhatWeDo", () => {
  const defaultProps = {
    initialHeading: null as string | null,
    initialCards: null as { title: string; description: string }[] | null,
    isAdmin: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it("renders the What We Do heading", () => {
    render(<WhatWeDo {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "What We Do" })).toBeInTheDocument();
  });

  it("displays the Custom Stairs & Railings service card", () => {
    render(<WhatWeDo {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Custom Stairs & Railings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Hand-crafted staircases and railings designed to complement any home aesthetic/,
      ),
    ).toBeInTheDocument();
  });

  it("displays the Millwork & Cabinetry service card", () => {
    render(<WhatWeDo {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "Millwork & Cabinetry" })).toBeInTheDocument();
    expect(
      screen.getByText(
        /Built-in cabinets, shelving, and architectural millwork tailored to your vision/,
      ),
    ).toBeInTheDocument();
  });

  it("displays the Flooring Installation service card", () => {
    render(<WhatWeDo {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Flooring Installation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Premium hardwood flooring selection and expert installation/),
    ).toBeInTheDocument();
  });

  it("displays the Home Renovations service card", () => {
    render(<WhatWeDo {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "Home Renovations" })).toBeInTheDocument();
    expect(
      screen.getByText(/Full renovation projects with woodworking and custom details/),
    ).toBeInTheDocument();
  });

  it("displays the Restoration & Repair service card", () => {
    render(<WhatWeDo {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Restoration & Repair" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Expert restoration and repair of existing woodwork and furniture/),
    ).toBeInTheDocument();
  });

  it("displays the Design Consultation service card", () => {
    render(<WhatWeDo {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Design Consultation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Personalized consultations to bring your vision to life/),
    ).toBeInTheDocument();
  });

  it("shows Edit button only when isAdmin is true", () => {
    const { rerender } = render(<WhatWeDo {...defaultProps} isAdmin={false} />);

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    rerender(<WhatWeDo {...defaultProps} isAdmin />);

    expect(
      screen.getByRole("button", { name: "Edit" }),
    ).toBeInTheDocument();
  });

  it("enters edit mode and renders inputs for heading and each card", async () => {
    const user = userEvent.setup();

    render(<WhatWeDo {...defaultProps} isAdmin />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const headingInput = screen.getByLabelText("What We Do heading");
    expect(headingInput).toBeInTheDocument();

    // At least the first card title/description inputs should be present
    expect(
      screen.getByLabelText("Card 1 title"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Card 1 description"),
    ).toBeInTheDocument();
  });

  it("saves updated heading and cards and calls the site settings API and router.refresh", async () => {
    const user = userEvent.setup();

    render(<WhatWeDo {...defaultProps} isAdmin />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const headingInput = screen.getByLabelText("What We Do heading");
    const firstTitleInput = screen.getByLabelText("Card 1 title");
    const firstDescriptionInput = screen.getByLabelText("Card 1 description");

    await user.clear(headingInput);
    await user.type(headingInput, "Updated What We Do");
    await user.clear(firstTitleInput);
    await user.type(firstTitleInput, "Updated Card 1");
    await user.clear(firstDescriptionInput);
    await user.type(
      firstDescriptionInput,
      "Updated description for card 1.",
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toHaveBeenCalled();
    });

    const [, options] = mockFetch.mock.calls[0];
    const payload = JSON.parse((options as RequestInit).body as string);

    expect(payload.key).toBe("about.whatWeDo");
    expect(payload.value).toEqual(
      expect.stringContaining("Updated What We Do"),
    );
    expect(payload.value).toEqual(
      expect.stringContaining("Updated Card 1"),
    );
    expect(payload.value).toEqual(
      expect.stringContaining("Updated description for card 1."),
    );
  });

  it("cancels edits and returns to view mode without saving", async () => {
    const user = userEvent.setup();

    render(<WhatWeDo {...defaultProps} isAdmin />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const headingInput = screen.getByLabelText("What We Do heading");
    await user.clear(headingInput);
    await user.type(headingInput, "Changed but not saved");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("heading", { name: "What We Do" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("What We Do heading"),
    ).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("uses initial heading and cards from props when provided", () => {
    const initialCards = [
      { title: "Card A", description: "Description A" },
      { title: "Card B", description: "Description B" },
    ];

    render(
      <WhatWeDo
        {...defaultProps}
        initialHeading="From Database"
        initialCards={initialCards}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "From Database" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Description A"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Description B"),
    ).toBeInTheDocument();
  });
});
