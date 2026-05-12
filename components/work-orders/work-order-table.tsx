'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WorkOrderStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { WorkOrderStatusBadge } from './work-order-status-badge'
import { Search, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

interface WorkOrder {
  id: string
  description: string
  status: WorkOrderStatus
  cost: number | null
  createdAt: Date
  completedAt: Date | null
  vehicle: {
    id: string
    vehicleId: string
    make: string
    model: string
    year: number
  }
}

interface WorkOrderTableProps {
  workOrders: WorkOrder[]
}

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL')

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      search === '' ||
      wo.description.toLowerCase().includes(search.toLowerCase()) ||
      wo.vehicle.vehicleId.toLowerCase().includes(search.toLowerCase()) ||
      `${wo.vehicle.make} ${wo.vehicle.model}`.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === WorkOrderStatus.PENDING ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(WorkOrderStatus.PENDING)}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === WorkOrderStatus.IN_PROGRESS ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(WorkOrderStatus.IN_PROGRESS)}
          >
            In Progress
          </Button>
          <Button
            variant={statusFilter === WorkOrderStatus.COMPLETED ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(WorkOrderStatus.COMPLETED)}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium">Vehicle</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Cost</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No work orders found
                  </td>
                </tr>
              ) : (
                filteredWorkOrders.map((wo) => (
                  <tr key={wo.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/vehicles/${wo.vehicle.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {wo.vehicle.vehicleId}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm max-w-md truncate">{wo.description}</td>
                    <td className="py-3 px-4">
                      <WorkOrderStatusBadge status={wo.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {wo.cost ? `$${wo.cost.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {format(new Date(wo.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/work-orders/${wo.id}`}>
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
        Showing {filteredWorkOrders.length} of {workOrders.length} work orders
      </div>
    </div>
  )
}
