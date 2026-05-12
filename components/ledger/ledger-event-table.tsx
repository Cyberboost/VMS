'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LedgerEventType, LedgerVerificationStatus } from '@prisma/client'
import { Search, ExternalLink, Download } from 'lucide-react'
import { format } from 'date-fns'

interface LedgerEvent {
  id: string
  eventType: LedgerEventType
  assetId: string
  eventHash: string
  timestamp: Date
  verificationStatus: LedgerVerificationStatus
  actorUserId?: string | null
}

interface LedgerEventTableProps {
  events: LedgerEvent[]
  showAssetId?: boolean
  onExportCSV?: () => void
}

export function LedgerEventTable({ events, showAssetId = true, onExportCSV }: LedgerEventTableProps) {
  const [search, setSearch] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<LedgerEventType | 'ALL'>('ALL')

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      search === '' ||
      event.eventHash.toLowerCase().includes(search.toLowerCase()) ||
      event.assetId.toLowerCase().includes(search.toLowerCase())

    const matchesType = eventTypeFilter === 'ALL' || event.eventType === eventTypeFilter

    return matchesSearch && matchesType
  })

  const eventTypeLabels: Record<LedgerEventType, string> = {
    [LedgerEventType.INSPECTION_COMPLETED]: 'Inspection',
    [LedgerEventType.WORK_ORDER_CLOSED]: 'Work Order',
    [LedgerEventType.PART_INSTALLED]: 'Part Install',
    [LedgerEventType.BRAKE_REPLACEMENT]: 'Brake Replace',
    [LedgerEventType.OIL_CHANGE]: 'Oil Change',
    [LedgerEventType.VENDOR_APPROVAL]: 'Vendor Approved',
    [LedgerEventType.COMPLIANCE_DOCUMENT_UPLOADED]: 'Compliance Doc',
    [LedgerEventType.ASSET_TRANSFERRED]: 'Asset Transfer',
    [LedgerEventType.ASSET_RETIRED]: 'Asset Retired',
    [LedgerEventType.MAINTENANCE_COMPLETED]: 'Maintenance',
    [LedgerEventType.SAFETY_CHECK_PASSED]: 'Safety Check',
    [LedgerEventType.CERTIFICATION_RENEWED]: 'Cert Renewed',
    [LedgerEventType.DEFECT_RESOLVED]: 'Defect Resolved',
  }

  const getVerificationBadge = (status: LedgerVerificationStatus) => {
    const config = {
      [LedgerVerificationStatus.VERIFIED]: 'bg-green-500 hover:bg-green-600 text-white',
      [LedgerVerificationStatus.PENDING]: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      [LedgerVerificationStatus.FAILED]: 'bg-red-500 hover:bg-red-600 text-white',
      [LedgerVerificationStatus.ANCHORED]: 'bg-blue-500 hover:bg-blue-600 text-white',
    }
    return config[status] || 'bg-gray-500 hover:bg-gray-600 text-white'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hash or asset ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={eventTypeFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEventTypeFilter('ALL')}
          >
            All Events
          </Button>
          <Button
            variant={eventTypeFilter === LedgerEventType.INSPECTION_COMPLETED ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEventTypeFilter(LedgerEventType.INSPECTION_COMPLETED)}
          >
            Inspections
          </Button>
          <Button
            variant={eventTypeFilter === LedgerEventType.WORK_ORDER_CLOSED ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEventTypeFilter(LedgerEventType.WORK_ORDER_CLOSED)}
          >
            Work Orders
          </Button>
          {onExportCSV && (
            <Button variant="outline" size="sm" onClick={onExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium">Event Type</th>
                {showAssetId && (
                  <th className="text-left py-3 px-4 text-sm font-medium">Asset ID</th>
                )}
                <th className="text-left py-3 px-4 text-sm font-medium">Event Hash</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={showAssetId ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    No ledger events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{eventTypeLabels[event.eventType]}</Badge>
                    </td>
                    {showAssetId && (
                      <td className="py-3 px-4 text-sm font-mono">{event.assetId.slice(0, 8)}</td>
                    )}
                    <td className="py-3 px-4">
                      <code className="text-xs font-mono">
                        {event.eventHash.slice(0, 8)}...{event.eventHash.slice(-8)}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${getVerificationBadge(event.verificationStatus)} border-transparent`}>
                        {event.verificationStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/trust-ledger/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredEvents.length} of {events.length} events
      </div>
    </div>
  )
}
