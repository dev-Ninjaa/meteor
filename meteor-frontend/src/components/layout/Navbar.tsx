import React, { useState } from 'react'
import { GithubIcon } from '../shared/GithubIcon'
import { Globe, ArrowUpRight, LayoutDashboard, Store, Wallet, ArrowLeft, User, Bell } from 'lucide-react'
import { WalletConnectButton } from '../../features/auth/WalletConnectButton'
import { NotificationCenter } from '../../features/notifications/NotificationCenter'
import { useUnreadCount } from '../../hooks/useNotifications'
import { useAuth, useMe } from '../../hooks/useAuth'
import { useAccount } from 'wagmi'
import { useLocation, Link } from 'react-router-dom'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const isAppRoute = location.pathname.startsWith('/app')
  const isLanding = location.pathname === '/'
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { getToken } = useAuth()
  // Subscribe to ['user','me'] so login/logout re-renders this component and re-evaluates the gate below
  const { data: currentUser } = useMe()
  const { data: unreadCount } = useUnreadCount({ enabled: isAppRoute && (!!currentUser || !!getToken()) })

  const navItems = [
    { path: '/app/marketplace', label: 'Marketplace', icon: Store },
    { path: '/app/dashboard', label: 'My Tasks', icon: LayoutDashboard },
    { path: '/app/wallet', label: 'Wallet', icon: Wallet },
    { path: '/app/profile', label: 'Profile', icon: User },
  ]

  const landingSections = [
    { id: 'thesis', label: 'Thesis' },
    { id: 'vision', label: 'Vision' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'why-now', label: 'Why Now' },
    { id: 'use-cases', label: 'Use Cases' },
  ]

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
      <nav className="liquid-glass rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between pointer-events-auto backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2.5 group text-left focus:outline-none">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#836EF9] to-white flex items-center justify-center text-black font-bold shadow-lg shadow-[#836EF9]/20 group-hover:scale-105 transition-transform">
            <Globe className="w-4 h-4 text-black animate-spin-slow" />
          </div>
          <span className="font-heading italic text-2xl text-white tracking-tight font-semibold">
            Meteor
          </span>
        </Link>

        {/* Center: Landing Section links (only on /) */}
        {isLanding && (
          <div className="hidden md:flex items-center gap-6">
            {landingSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                {section.label}
              </a>
            ))}
          </div>
        )}

        {/* Center: App Navigation (only on /app routes) */}
        {isAppRoute && (
          <div className="flex items-center gap-1 liquid-glass rounded-full px-2 py-1 bg-black/40 border border-white/10 backdrop-blur-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  location.pathname === item.path
                    ? 'bg-white text-black font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* GitHub button */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="GitHub Repository"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* Notifications bell - only on /app routes */}
          {isAppRoute && (
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {(unreadCount ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#836EF9] text-white text-[9px] font-semibold flex items-center justify-center">
                  {(unreadCount ?? 0) > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Wallet Connect Button - only on /app routes */}
          {isAppRoute && <WalletConnectButton />}

          {/* Landing page CTA */}
          {isLanding && (
            <Link
              to="/app/marketplace"
              className="bg-white hover:bg-white/90 text-black font-semibold text-xs rounded-full px-4 py-2 flex items-center gap-1 shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <span>Try MVP</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </nav>
      {isAppRoute && <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />}
    </header>
  )
};
