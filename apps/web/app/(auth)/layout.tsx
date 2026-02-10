'use client';

import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="relative">
      <Button
        className="absolute top-4 right-4"
        variant="ghost"
        size="icon"
        onClick={() => router.replace('/landing')}
      >
        <XIcon />
      </Button>
      <div className="flex h-full items-center justify-center">{children}</div>
    </div>
  );
}
