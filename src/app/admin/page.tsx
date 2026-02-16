'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import SettingsTab from './components/SettingsTab';

export default function AdminPage() {
  const { status } = useSession();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    redirect('/admin/login');
  }

  return (
    <div className="pt-16">
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Manage categories and tags for your projects
            </p>
          </div>

          <div className="mt-6">
            <SettingsTab />
          </div>
        </div>
      </div>
    </div>
  );
}
