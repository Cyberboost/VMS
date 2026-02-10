import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const handleSignOut = async () => {
    'use server'
    await signOut()
  }

  const user = {
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} onSignOut={handleSignOut} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
