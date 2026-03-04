import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/AuthContext'
import type { AxiosError } from 'axios'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: string })?.from || '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ username, password })
      navigate(from, { replace: true })
    } catch (err) {
      const axiosError = err as AxiosError<{
        non_field_errors?: string[]
        detail?: string
      }>
      const data = axiosError.response?.data
      if (data?.non_field_errors) {
        setError(data.non_field_errors[0])
      } else if (data?.detail) {
        setError(data.detail)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-parchment/10 bg-bg-secondary p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-accent-gold">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-parchment/60">
            Sign in to your D&D Forge account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
            >
              {error}
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
              placeholder="Enter your username"
            />
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
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-parchment/20 bg-bg-primary px-3 py-2 text-parchment placeholder-parchment/40 focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-gold px-4 py-2 font-medium text-bg-primary transition-colors hover:bg-accent-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-parchment/60">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-accent-gold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
