'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Car,
  Users,
  AlertTriangle,
  Archive,
  FileText,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Surplus', href: '/surplus', icon: Archive },
  { name: 'Reports', href: '/reports', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <h1 className="text-xl font-bold">Fleet Admin Console</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-700 px-3 py-4">
        <p className="text-xs text-slate-400">Version 1.0.0</p>
      </div>
    </div>
  )
}
