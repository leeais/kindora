'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { SignInValues } from '@/app/(auth)/sign-in/page';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { User } from '@/types/models/user.type';
import { AuthResponse, ErrorResponse, Response } from '@/types/reponse.types';

export const PasswordSchema = z
  .string()
  .min(8, 'Mật khẩu phải từ 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt');

export const RegisterSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    username: z.string().min(3, 'Username phải từ 3 ký tự').max(30),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAuth();
  const router = useRouter();

  const registerMutation = useMutation<
    AuthResponse,
    ErrorResponse,
    RegisterValues
  >({
    mutationFn: async (data: RegisterValues) =>
      await http.post<any, Response<{ user: User }>>(
        '/api/users/auth/register',
        data,
      ),
    onSuccess: (data) => {
      toast.success('Create account successfully', {
        position: 'top-right',
      });
      setUser(data.data.user);
      router.push('/verify-email');
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
      });
    },
  });

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRegister = (values: RegisterValues) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleRegister)}
            className="space-y-6"
          >
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
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
                  <FormDescription>
                    Password must be at least 8 characters long and contain at
                    least one uppercase letter, one lowercase letter, one
                    number, and one special character.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="******"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <Spinner /> : 'Sign up'}
            </Button>

            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
                  onClick={() => router.push('/sign-in')}
                  type="button"
                >
                  Sign in
                </Button>
              </p>
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
