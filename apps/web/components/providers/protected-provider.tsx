'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';

export default function ProtectedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user?.emailVerifiedAt) {
      router.push('/verify-email');
    }
  }, [user, router, loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
