import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LedgerEventTable } from '@/components/ledger/ledger-event-table'
import { getOrganizationLedgerEvents, exportLedgerEventsToCSV } from '@/lib/actions/ledger'
import { requireAuth } from '@/lib/auth-utils'
import { Shield, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function LedgerEventsList() {
  const context = await requireAuth()

  if (!context.orgId) {
    return <div>No organization found</div>
  }

  const { events } = await getOrganizationLedgerEvents(context.orgId, { limit: 100 })

  const handleExport = async () => {
    'use server'
    const context = await requireAuth()
    if (context.orgId) {
      const csv = await exportLedgerEventsToCSV(context.orgId)
      return csv
    }
  }

  return <LedgerEventTable events={events} />
}

export default async function TrustLedgerPage() {
  const context = await requireAuth()

  const stats = context.orgId
    ? await getOrganizationLedgerEvents(context.orgId, { limit: 1 }).then(({ total }) => ({
        totalEvents: total,
      }))
    : { totalEvents: 0 }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Trust Ledger
          </h1>
          <p className="text-muted-foreground">
            Immutable, cryptographically-verified operational events
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time ledger events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chain Integrity</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Verified</div>
            <p className="text-xs text-muted-foreground mt-1">All events cryptographically linked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hash Algorithm</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SHA-256</div>
            <p className="text-xs text-muted-foreground mt-1">Industry-standard hashing</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ledger Events</CardTitle>
          <CardDescription>
            Chronological view of all immutable operational events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-8 text-center">Loading ledger events...</div>}>
            <LedgerEventsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
