/**
 * @module components/LogoutButton
 * @description Logout button component for authenticated users.
 */
"use client";

import { useSession, signOut } from "next-auth/react";

/**
 * Logout button that appears for authenticated users.
 * Positioned as a fixed element below the navbar on desktop.
 * Only renders when the user is authenticated.
 *
 * @returns The logout button JSX element, or `null` if not authenticated
 *
 * @example
 * ```tsx
 * <LogoutButton />
 * ```
 */
export default function LogoutButton() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Don't render anything if not authenticated or still loading
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/admin/login',
      redirect: true
    });
  };

  return (
    <div className="absolute top-20 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 flex justify-end pointer-events-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="hidden md:block px-8 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-lg min-w-30"
        >
          Logout
        </button>
      </div>
    </div>
  );
}