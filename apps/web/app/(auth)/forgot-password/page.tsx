'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Mail,
  KeyRound,
  ShieldCheck,
  EyeIcon,
  EyeOffIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import z from 'zod';

import { PasswordSchema } from '@/app/(auth)/sign-up/page';
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import http from '@/lib/http';
import { cn } from '@/lib/utils';
import { ErrorResponse, Response } from '@/types/reponse.types';

// --- Schemas ---
const EmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const OtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 characters'),
});

const ResetPasswordSchema = z
  .object({
    resetToken: z.string({ error: 'Reset token is required' }),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailValues = z.infer<typeof EmailSchema>;
type OtpValues = z.infer<typeof OtpSchema>;
type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

// --- Components ---

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { step: 1, label: 'Email', icon: Mail },
    { step: 2, label: 'Verify', icon: ShieldCheck },
    { step: 3, label: 'New Password', icon: KeyRound },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep >= s.step;
          const isCurrent = currentStep === s.step;

          return (
            <div
              key={s.step}
              className="flex flex-col items-center gap-2 bg-transparent px-6"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isActive
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground',
                )}
              >
                {isActive && currentStep > s.step ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300 absolute -bottom-6 w-max text-center',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                  isCurrent ? 'font-bold' : '',
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-4" /> {/* Spacer for absolute positioned labels */}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const emailMutation = useMutation<Response, ErrorResponse, EmailValues>({
    mutationFn: (data: EmailValues) =>
      http.post('/api/users/auth/forgot-password', data),
    onSuccess: () => {
      toast.success('Verification code sent to your email');
      otpForm.setValue('email', emailForm.getValues('email'));
      setStep(2);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send verification code');
    },
  });

  const otpMutation = useMutation<
    Response<{ resetToken: string }>,
    ErrorResponse,
    OtpValues
  >({
    mutationFn: (data: OtpValues) =>
      http.post('/api/users/auth/verify-reset-code', data),
    onSuccess: (data) => {
      toast.success('Verification successful');
      passwordForm.setValue('resetToken', data.data.resetToken);
      setStep(3);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify OTP');
    },
  });

  const resetPasswordMutation = useMutation<
    Response,
    ErrorResponse,
    ResetPasswordValues
  >({
    mutationFn: (data: ResetPasswordValues) =>
      http.post('/api/users/auth/reset-password', data),
    onSuccess: () => {
      toast.success('Password reset successfully', {
        position: 'top-right',
      });
      router.push('/sign-in');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  // Forms
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  });

  const passwordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      resetToken: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handlers
  const handleEmailSubmit = async (values: EmailValues) => {
    emailMutation.mutate(values);
  };

  const handleOtpSubmit = async (values: OtpValues) => {
    otpMutation.mutate(values);
  };

  const handlePasswordSubmit = async (values: ResetPasswordValues) => {
    resetPasswordMutation.mutate(values);
  };

  const handleResendOtp = () => {
    emailMutation.mutate({
      email: otpForm.getValues('email'),
    });
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Reset Password'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {step === 1 && 'Enter your email to receive a verification code'}
            {step === 2 && 'Verification code sent to your email'}
            {step === 3 && 'Create a new password for your account'}
          </p>
        </div>

        <StepIndicator currentStep={step} />

        {/* Step 1: Email */}
        {step === 1 && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="name@example.com"
                          className="pl-9 "
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="w-1/3 "
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-2/3  group"
                  disabled={emailMutation.isPending}
                >
                  {emailMutation.isPending && (
                    <Spinner className="mr-2 h-4 w-4" />
                  )}
                  Continue
                  {!emailMutation.isPending && (
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
              className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"
            >
              <FormField
                control={otpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} hidden />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={otpForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center space-y-4">
                    <FormLabel>6-digit verification code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot
                            index={0}
                            className="rounded-md border h-12 w-10 text-lg shadow-sm"
                          />
                          <InputOTPSlot
                            index={1}
                            className="rounded-md border h-12 w-10 text-lg shadow-sm"
                          />
                          <InputOTPSlot
                            index={2}
                            className="rounded-md border h-12 w-10 text-lg shadow-sm"
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot
                            index={3}
                            className="rounded-md border h-12 w-10 text-lg shadow-sm"
                          />
                          <InputOTPSlot
                            index={4}
                            className="rounded-md border h-12 w-10 text-lg shadow-sm"
                          />
                          <InputOTPSlot
                            index={5}
                            className="rounded-md border h-12 w-10 text-lg shadow-sm"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="w-1/3 "
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-2/3  group"
                  disabled={otpMutation.isPending}
                >
                  {otpMutation.isPending && (
                    <Spinner className="mr-2 h-4 w-4" />
                  )}
                  Confirm
                  {!otpMutation.isPending && (
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Didn&apos;t receive the code?{' '}
                <Button
                  className="px-0"
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={emailMutation.isPending}
                >
                  Resend
                </Button>
              </p>
            </form>
          </Form>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"
            >
              <FormField
                control={passwordForm.control}
                name="resetToken"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} hidden />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-9 "
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
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-9 "
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full  text-base group"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending && (
                  <Spinner className="mr-2 h-4 w-4" />
                )}
                Reset Password
                {!resetPasswordMutation.isPending && (
                  <CheckCircle2 className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
