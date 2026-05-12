import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkOrderStatusBadge } from '@/components/work-orders/work-order-status-badge'
import { getWorkOrderById } from '@/lib/actions/work-orders'
import { getAssetLedgerEvents } from '@/lib/actions/ledger'
import { ArrowLeft, Calendar, DollarSign, Wrench } from 'lucide-react'
import { format } from 'date-fns'
import { LedgerEventType } from '@prisma/client'

export const dynamic = 'force-dynamic'

async function WorkOrderDetails({ id }: { id: string }) {
  try {
    const workOrder = await getWorkOrderById(id)

    // Fetch related ledger events
    let ledgerEvents: any[] = []
    try {
      const events = await getAssetLedgerEvents(workOrder.vehicleId, {
        eventTypes: [LedgerEventType.WORK_ORDER_CLOSED],
        limit: 10,
      })
      // Filter to only this work order
      ledgerEvents = events.filter((e: any) =>
        e.metadata &&
        typeof e.metadata === 'object' &&
        'workOrderId' in e.metadata &&
        e.metadata.workOrderId === id
      )
    } catch (error) {
      console.error('Failed to fetch ledger events:', error)
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Work Order Details</h1>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            <p className="text-muted-foreground">
              Created {format(new Date(workOrder.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <Link href="/work-orders">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Orders
            </Button>
          </Link>
        </div>

        {/* Main Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Work Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Work Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Description</div>
                <div className="mt-1">{workOrder.description}</div>
              </div>

              {workOrder.cost && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Cost</div>
                  <div className="mt-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    ${workOrder.cost.toString()}
                  </div>
                </div>
              )}

              {workOrder.completedAt && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Completed On</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(workOrder.completedAt), 'MMMM d, yyyy h:mm a')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Vehicle ID</div>
                <Link
                  href={`/vehicles/${workOrder.vehicle.id}`}
                  className="mt-1 text-blue-600 hover:underline font-medium"
                >
                  {workOrder.vehicle.vehicleId}
                </Link>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Make & Model</div>
                <div className="mt-1">
                  {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                </div>
              </div>

              {workOrder.vehicle.vin && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">VIN</div>
                  <div className="mt-1 font-mono text-sm">{workOrder.vehicle.vin}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Parts Installed */}
        {workOrder.partInstallations && workOrder.partInstallations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Parts Installed</CardTitle>
              <CardDescription>
                Parts used to complete this work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workOrder.partInstallations.map((installation: any) => (
                  <div
                    key={installation.id}
                    className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{installation.part.partName}</div>
                      <div className="text-sm text-muted-foreground">
                        {installation.part.partNumber}
                        {installation.part.manufacturer && ` • ${installation.part.manufacturer}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Qty: {installation.quantity}</div>
                      {installation.cost && (
                        <div className="text-sm text-muted-foreground">
                          ${installation.cost.toString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Immutable Ledger Events */}
        {ledgerEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Immutable Ledger Events</CardTitle>
              <CardDescription>
                Cryptographically verified events generated from this work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ledgerEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 space-y-2 bg-muted/30"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">Work Order Closed</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(event.timestamp), 'MMMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">
                        {event.verificationStatus}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-muted-foreground">Event Hash</div>
                      <div className="font-mono text-xs mt-1 break-all">
                        {event.eventHash}
                      </div>
                    </div>
                    {event.previousEventHash && (
                      <div className="text-sm">
                        <div className="font-medium text-muted-foreground">Previous Hash</div>
                        <div className="font-mono text-xs mt-1 break-all">
                          {event.previousEventHash}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    notFound()
  }
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense fallback={<div className="py-8">Loading work order...</div>}>
      <WorkOrderDetails id={id} />
    </Suspense>
  )
}
