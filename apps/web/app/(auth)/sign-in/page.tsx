'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import http from '@/lib/http';
import { AuthResponse, ErrorResponse } from '@/types/reponse.types';



export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export type SignInValues = z.infer<typeof LoginSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { setCredentials } = useAuth();

  const loginMutation = useMutation<AuthResponse, ErrorResponse, SignInValues>({
    mutationFn: async (data: SignInValues) =>
      await http.post<any, AuthResponse>('/api/users/auth/login', data),
    onSuccess: (data) => {
      setCredentials(data.data.user, data.data.accessToken!);
      toast.success('Login successfully', {
        position: 'top-right',
      });
      if (!data.data.user.emailVerifiedAt) {
        router.push('/verify-email');
      } else {
        router.push('/');
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
    },
  });

  const form = useForm<SignInValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = (values: SignInValues) => {
    loginMutation.mutate(values);
  };

  const handleLoginWithGoogle = () => {
    // Redirect directly to backend Google Auth endpoint to avoid CORS
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/users/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="******"
                        {...field}
                      />
                      <Button
                        variant="link"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end">
              <Button
                variant="link"
                className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
                onClick={() => router.push('/forgot-password')}
                type="button"
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Spinner /> : 'Sign in'}
            </Button>

            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
                  onClick={() => router.push('/sign-up')}
                  type="button"
                >
                  Sign up
                </Button>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">
                Or continue with
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="flex items-center justify-center">
              <Button
                className="w-full"
                variant="outline"
                type="button"
                onClick={handleLoginWithGoogle}
              >
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="100"
                    height="100"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    ></path>
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    ></path>
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                  </svg>
                  Login with Google
                </>
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-center text-sm text-muted-foreground">
                By signing up, you agree to our{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
                  onClick={() => router.push('/terms')}
                  type="button"
                >
                  Terms of Service
                </Button>{' '}
                and{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
                  onClick={() => router.push('/privacy')}
                  type="button"
                >
                  Privacy Policy
                </Button>
              </span>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
