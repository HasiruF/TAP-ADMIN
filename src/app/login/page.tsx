'use client'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthContext } from '@/lib/api/auth/AuthContext'
import { useLogin } from '@/features/auth/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { loginSchema, LoginInput } from '@/lib/schemas/loginSchema'
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

      setSession(
        res.token,
        {
          id: res.user.id,
          name: `${res.user.firstName} ${res.user.lastName}`.trim(),
          email: res.user.email,
          role: res.user.role?.name?.toLowerCase() ?? 'admin',
        },
        res.refreshToken,
        res.tokenExpires
      )

      await queryClient.invalidateQueries({ queryKey: ['me'] })

      router.push('/admin')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.'

      setServerError(message)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        className="w-full max-w-md rounded-[32px] border p-8"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45)',
        }}
      >
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <img
            src="/Primary.svg"
            alt="TAP"
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
            <div className="text-red-500 text-sm">{serverError}</div>
          )}
          {/* EMAIL */}
          <div className="space-y-2">
            <label>Email</label>

            <Input placeholder="admin@tap.com" {...register('email')} />

            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label>Password</label>

            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />

            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            className="w-full h-12 rounded-2xl"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--gold)',
            }}
          >
            {login.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
