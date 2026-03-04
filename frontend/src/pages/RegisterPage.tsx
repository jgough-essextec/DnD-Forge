import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/AuthContext'
import type { AxiosError } from 'axios'

interface FieldErrors {
  username?: string[]
  email?: string[]
  password?: string[]
  password_confirm?: string[]
  non_field_errors?: string[]
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError(null)
    setIsSubmitting(true)

    try {
      await register({ username, email, password, passwordConfirm })
      navigate('/', { replace: true })
    } catch (err) {
      const axiosError = err as AxiosError<FieldErrors>
      const data = axiosError.response?.data
      if (data) {
        if (data.non_field_errors) {
          setGeneralError(data.non_field_errors[0])
        }
        setErrors(data)
      } else {
        setGeneralError('Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function fieldError(field: keyof FieldErrors): string | null {
    const msgs = errors[field]
    return msgs && msgs.length > 0 ? msgs[0] : null
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-parchment/10 bg-bg-secondary p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-accent-gold">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-parchment/60">
            Join D&D Forge and start building characters
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div
              role="alert"
              className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
            >
              {generalError}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-parchment/80"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="mt-1 block w-full rounded-md border border-parchment/20 bg-bg-primary px-3 py-2 text-parchment placeholder-parchment/40 focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
              placeholder="Choose a username"
            />
            {fieldError('username') && (
              <p className="mt-1 text-xs text-red-400">
                {fieldError('username')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-parchment/80"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-parchment/20 bg-bg-primary px-3 py-2 text-parchment placeholder-parchment/40 focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
              placeholder="you@example.com"
            />
            {fieldError('email') && (
              <p className="mt-1 text-xs text-red-400">
                {fieldError('email')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-parchment/80"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-parchment/20 bg-bg-primary px-3 py-2 text-parchment placeholder-parchment/40 focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
              placeholder="At least 8 characters"
            />
            {fieldError('password') && (
              <p className="mt-1 text-xs text-red-400">
                {fieldError('password')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-parchment/80"
            >
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-parchment/20 bg-bg-primary px-3 py-2 text-parchment placeholder-parchment/40 focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
              placeholder="Repeat your password"
            />
            {fieldError('password_confirm') && (
              <p className="mt-1 text-xs text-red-400">
                {fieldError('password_confirm')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-gold px-4 py-2 font-medium text-bg-primary transition-colors hover:bg-accent-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-parchment/60">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent-gold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
