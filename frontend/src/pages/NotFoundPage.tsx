import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <h1 className="font-heading text-6xl text-accent-gold mb-4">404</h1>
      <p className="text-parchment/80 mb-6">
        This page has been lost to the Astral Plane.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-accent-gold px-6 py-2 font-semibold text-bg-primary transition-colors hover:bg-accent-gold/80"
      >
        Return Home
      </Link>
    </div>
  )
}
