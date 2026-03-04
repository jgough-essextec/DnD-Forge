import { Link, Outlet, useLocation } from 'react-router-dom'
import { Home, PlusCircle, Dice5, Map, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/character/new', icon: PlusCircle, label: 'Create' },
  { to: '/dice', icon: Dice5, label: 'Dice' },
  { to: '/campaigns', icon: Map, label: 'Campaigns' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function MainLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop top nav */}
      <nav className="hidden sm:flex items-center gap-1 border-b border-parchment/10 bg-bg-secondary px-6 py-3">
        <Link to="/" className="font-heading text-xl text-accent-gold mr-8">
          D&D Forge
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              location.pathname === item.to
                ? 'bg-accent-gold/10 text-accent-gold'
                : 'text-parchment/60 hover:text-parchment'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="pb-20 sm:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-parchment/10 bg-bg-secondary py-2 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
              location.pathname === item.to
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
