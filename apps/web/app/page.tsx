'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import http from '@/lib/http';
import { ErrorResponse } from '@/types/reponse.types';

export default function Home() {
  const { clearAuthState } = useAuth();
  const router = useRouter();

  const logoutMutation = useMutation<void, ErrorResponse>({
    mutationFn: () => http.delete('/api/users/auth/logout'),
    onSuccess: () => {
      clearAuthState();
      toast.success('Logout successfully');
      router.push('/sign-in');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div>
      <h1 className="text-primary">Hello World</h1>
      <ModeToggle />
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}
