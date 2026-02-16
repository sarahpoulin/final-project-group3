/**
 * @module components/Providers
 * @description Root providers component wrapping the application with necessary context providers.
 */
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * Props for the Providers component.
 */
interface ProvidersProps {
  /** Child components to be wrapped with providers */
  children: ReactNode;
}

/**
 * Root providers component that wraps the application with necessary context providers.
 * Currently provides:
 * - NextAuth SessionProvider for authentication state
 *
 * @param props - Component props
 * @param props.children - Child components to render within providers
 * @returns The children wrapped with all necessary providers
 *
 * @example
 * ```tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
