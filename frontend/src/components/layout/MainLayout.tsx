import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Dice5, Map, Settings, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/AuthContext'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { PageTransition } from '@/components/layout/PageTransition'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/character/new', icon: PlusCircle, label: 'Create' },
  { to: '/dice', icon: Dice5, label: 'Dice' },
  { to: '/campaigns', icon: Map, label: 'Campaigns' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

/**
 * Determines whether a navigation item should be highlighted as active.
 *
 * - Home ("/") highlights only on exact match.
 * - Campaigns ("/campaigns") highlights on any campaign-related route
 *   (e.g. /campaigns, /campaign/:id, /campaign/:id/encounter/:eid).
 * - All other items use exact pathname matching.
 */
export function isNavActive(itemTo: string, pathname: string): boolean {
  if (itemTo === '/') {
    return pathname === '/'
  }

  if (itemTo === '/campaigns') {
    return pathname === '/campaigns' || pathname.startsWith('/campaign/')
  }

  return pathname === itemTo
}

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop top nav */}
      <nav
        className="hidden sm:flex items-center gap-1 border-b border-parchment/10 bg-bg-secondary px-6 py-3"
        aria-label="Main navigation"
      >
        <Link to="/" className="font-heading text-xl text-accent-gold mr-8">
          D&D Forge
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              isNavActive(item.to, location.pathname)
                ? 'bg-accent-gold/10 text-accent-gold'
                : 'text-parchment/60 hover:text-parchment'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* User section */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-parchment/70">
              <User className="h-4 w-4" />
              {user.displayName || user.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-parchment/60 transition-colors hover:text-parchment"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm text-accent-gold transition-colors hover:bg-accent-gold/10"
          >
            Sign In
          </Link>
        )}
      </nav>

      {/* Breadcrumbs bar */}
      <div className="hidden sm:block border-b border-parchment/5 bg-bg-primary px-6 py-2">
        <Breadcrumbs />
      </div>

      {/* Main content with page transitions */}
      <main className="pb-20 sm:pb-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-parchment/10 bg-bg-secondary py-2 sm:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
              isNavActive(item.to, location.pathname)
                ? 'text-accent-gold'
                : 'text-parchment/60'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
