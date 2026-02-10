'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import http from '@/lib/http';
import { User } from '@/types/models/user.type';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCredentials } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const accessToken = searchParams.get('accessToken');
    const error = searchParams.get('error');

    if (error) {
      toast.error(decodeURIComponent(error));
      router.push('/sign-in');
      return;
    }

    if (!accessToken) {
      toast.error('No access token received');
      router.push('/sign-in');
      return;
    }

    const handleAuth = async () => {
      try {
        // Temporarily set token to allow fetching user
        useAuth.getState().setAccessToken(accessToken);

        // Fetch user profile
        const user = await http.get<any, User>('/api/users/me');

        // Update store with full credentials
        setCredentials(user, accessToken);

        toast.success('Đăng nhập thành công');
        router.push('/');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        router.push('/sign-in');
      }
    };

    handleAuth();
  }, [router, searchParams, setCredentials]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
      <p className="text-muted-foreground">Authenticating...</p>
    </div>
  );
}
