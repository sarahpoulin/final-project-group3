/**
 * @file AdminPage component tests.
 *
 * Verifies that the AdminPage component handles authentication states correctly
 * and renders the dashboard (Category / Tag Editor) when authenticated.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPage from "./page";

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// Mock next/navigation redirect
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    mockRedirect(path);
    // Throw to simulate Next.js redirect behavior
    throw new Error(`Redirected to ${path}`);
  },
}));

// Mock SettingsTab (Category / Tag Editor)
vi.mock("./components/SettingsTab", () => ({
  default: () => <div data-testid="settings-tab">Settings Tab Content</div>,
}));

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to authenticated state
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { user: { email: "admin@example.com" } },
    });
  });

  describe("Authentication states", () => {
    it("renders loading state when session is loading", () => {
      mockUseSession.mockReturnValue({
        status: "loading",
        data: null,
      });

      render(<AdminPage />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      // Check for spinner element (div with animate-spin class)
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("redirects to login when unauthenticated", () => {
      mockUseSession.mockReturnValue({
        status: "unauthenticated",
        data: null,
      });

      // Suppress console.error for redirect error
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      try {
        render(<AdminPage />);
      } catch {
        // Expected: redirect throws an error
      }

      expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
      consoleSpy.mockRestore();
    });

    it("renders dashboard when authenticated", () => {
      render(<AdminPage />);

      expect(
        screen.getByRole("heading", { name: "Admin Dashboard" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Manage categories and tags for your projects"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("settings-tab")).toBeInTheDocument();
    });
  });
});
