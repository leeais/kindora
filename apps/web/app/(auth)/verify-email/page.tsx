'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RefreshCwIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import http from '@/lib/http';
import { User } from '@/types/models/user.type';
import { ErrorResponse, Response } from '@/types/reponse.types';

export const VerifyEmailSchema = z.object({
  code: z.string().length(6, 'Mã xác thực phải có 6 ký tự'),
});

type VerifyEmailValues = z.infer<typeof VerifyEmailSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, clearAuthState, setUser, accessToken, loading } = useAuth();

  const verifyMutation = useMutation<
    Response,
    ErrorResponse,
    VerifyEmailValues
  >({
    mutationFn: async (data: VerifyEmailValues) =>
      await http.post<any, Response>('/api/users/auth/verify-email', {
        email: user?.email,
        ...data,
      }),
    onSuccess: async () => {
      toast.success('Verify email successfully', {
        position: 'top-right',
      });
      const updatedUser = {
        ...user,
        emailVerifiedAt: Date.now().toString(),
      } as User;
      setUser(updatedUser);
      if (accessToken) {
        router.push('/');
      } else {
        router.push('/sign-in');
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
    },
  });

  const resendMutation = useMutation<
    Response,
    ErrorResponse,
    { email: string }
  >({
    mutationFn: async (data: { email: string }) =>
      await http.post<any, Response>(
        '/api/users/auth/resend-verification',
        data,
      ),
    onSuccess: () => {
      toast.success('Resend verification code successfully', {
        position: 'top-right',
      });
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
    },
  });

  const logoutMutation = useMutation<Response, ErrorResponse>({
    mutationFn: async () =>
      await http.delete<any, Response>('/api/users/auth/logout'),
    onSuccess: () => {
      clearAuthState();
      toast.success('Logout successfully', {
        position: 'top-right',
      });

      router.push('/sign-in');
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
    },
  });

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: {
      code: '',
    },
  });

  const handleVerify = (values: VerifyEmailValues) => {
    verifyMutation.mutate(values);
  };

  const handleResend = () => {
    resendMutation.mutate({
      email: user!.email!,
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/landing');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Verify email</h2>
          {user && (
            <span className="text-sm text-muted-foreground">
              Verify your email <i className="text-primary">{user.email}</i> to
              continue
            </span>
          )}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleVerify)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Verification Code</FormLabel>
                    <Button
                      variant="outline"
                      size={'xs'}
                      type="button"
                      onClick={handleResend}
                      disabled={resendMutation.isPending}
                    >
                      {resendMutation.isPending ? (
                        <Spinner />
                      ) : (
                        <RefreshCwIcon />
                      )}
                      Resend Code
                    </Button>
                  </div>
                  <FormControl>
                    <InputOTP
                      className="justify-center"
                      maxLength={6}
                      {...field}
                    >
                      <div className="flex items-center justify-center flex-1">
                        <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator className="mx-2" />
                        <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </div>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? <Spinner /> : 'Verify'}
            </Button>

            <p className="text-center">
              I no longer have access to this email address.
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLogout}
              type="button"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? <Spinner /> : 'Logout'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
