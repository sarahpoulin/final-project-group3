/**
 * @file Story component tests.
 *
 * Verifies that the Story component renders correctly and displays
 * the expected content: heading and paragraph text.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Story from "./story";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("Story", () => {
  const defaultProps = {
    initialHeading: null as string | null,
    initialBody: null as string | null,
    isAdmin: false,
  };

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
});
