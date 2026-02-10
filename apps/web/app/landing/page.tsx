import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold">Landing Page</h1>

      <Link href="/sign-in">
        <Button className="mt-4">Get started</Button>
      </Link>
    </div>
  );
}
