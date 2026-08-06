'use client'
import { useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthContext } from '@/lib/api/auth/AuthContext'
import { useLogin } from '@/features/auth/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { loginSchema, LoginInput } from '@/lib/schemas/loginSchema'

interface ApiErrorBody {
  message?: string | string[]
  errors?: Record<string, string>
  retryAfter?: number
}

function isApiErrorBody(err: unknown): err is ApiErrorBody {
  return typeof err === 'object' && err !== null
}

function getLoginErrorMessage(err: unknown): string {
  if (!isApiErrorBody(err)) {
    return 'Login failed. Please try again.'
  }

  if (err.errors?.password === 'invalidCredentials') {
    return 'Invalid email or password.'
  }

  if (err.errors?.email?.startsWith('needLoginViaProvider:')) {
    const provider = err.errors.email.split(':')[1]
    return `This account signs in with ${provider}. Please use ${provider} instead.`
  }

  if (err.errors) {
    const firstError = Object.values(err.errors)[0]
    if (firstError) return firstError
  }

  if (typeof err.message === 'string') {
    if (
      err.message === 'Account locked' &&
      typeof err.retryAfter === 'number'
    ) {
      const minutes = Math.ceil(err.retryAfter / 60)
      return `Your account has been locked due to too many failed login attempts. Please try again in ${minutes} minute${
        minutes === 1 ? '' : 's'
      }.`
    }

    if (err.message === 'Session expired') {
      return 'Your session has expired. Please log in again.'
    }

    if (/fetch|network/i.test(err.message)) {
      return 'Unable to reach the server. Please check your connection and try again.'
    }

    return "We couldn't log you in. Please check your credentials and try again."
  }

  if (Array.isArray(err.message) && err.message.length > 0) {
    return err.message[0]
  }

  return 'Login failed. Please try again.'
}

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const login = useLogin()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const { setSession } = useAuthContext()

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await login.mutateAsync(data)

      // This is the admin console — only admin accounts may sign in. A valid
      // artist/venue credential authenticates against the same backend, so we
      // gate on role here and never persist a session for non-admins.
      const role = res.user.role?.name?.toLowerCase()
      if (role !== 'admin') {
        setServerError(
          'This account does not have admin access to The Artist Platform.'
        )
        return
      }

      setSession(
        res.token,
        {
          id: res.user.id,
          name: `${res.user.firstName} ${res.user.lastName}`.trim(),
          email: res.user.email,
          role,
        },
        res.tokenExpires
      )

      await queryClient.invalidateQueries({ queryKey: ['me'] })

      router.push('/admin')
    } catch (err: unknown) {
      setServerError(getLoginErrorMessage(err))
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%)',
        }}
      />
      <div
        className="w-full max-w-md rounded-[32px] border p-8 relative"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45)',
        }}
      >
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <Image
            src="/Primary.svg"
            alt="TAP"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* TITLE */}
        <div className="text-center mb-8">
          <p
            className="mb-2"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            TAP ADMIN
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--foreground)',
              fontSize: '44px',
              lineHeight: 1,
              fontWeight: 500,
            }}
          >
            Welcome Back
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div
              role="alert"
              className="text-sm rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive"
            >
              {serverError}
            </div>
          )}
          {/* EMAIL */}
          <div className="space-y-2">
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                letterSpacing: '0.03em',
              }}
            >
              Email
            </label>

            <Input placeholder="Enter your Email" {...register('email')} />

            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                letterSpacing: '0.03em',
              }}
            >
              Password
            </label>

            <Input
              type="password"
              placeholder="Enter your Password"
              {...register('password')}
            />

            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            className="w-full h-12 rounded-2xl font-semibold transition-transform hover:-translate-y-px"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--gold)',
              color: '#191305',
            }}
          >
            {login.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
