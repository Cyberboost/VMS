'use client'

import { useState } from 'react'
import { User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopilotPanel } from '@/components/copilot-panel'

interface HeaderProps {
  user: {
    name: string
    email: string
    role: string
  } | null
  onSignOut?: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const [copilotOpen, setCopilotOpen] = useState(false)

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome back, {user?.name || 'User'}
          </h2>
          <p className="text-sm text-slate-500">{user?.role || 'Role'}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCopilotOpen(true)}
            className="gap-2"
          >
            <Bot className="h-4 w-4" />
            Ask Copilot
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          {onSignOut && (
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign Out
            </Button>
          )}
        </div>
      </header>
      <CopilotPanel isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </>
  )
}
