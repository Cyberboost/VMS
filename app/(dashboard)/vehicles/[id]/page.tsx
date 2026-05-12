export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getVehicleById } from '@/lib/actions/vehicle-actions'
import { getAssetTrustScore } from '@/lib/trust-score'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { WorkOrderStatusBadge } from '@/components/work-orders/work-order-status-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, AlertTriangle, Archive, Wrench, Plus, Shield } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import prisma from '@/lib/prisma'
import { LedgerEventType } from '@prisma/client'

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(params.id)

  if (!vehicle) {
    notFound()
  }

  // Fetch trust score
  const trustScore = await getAssetTrustScore(vehicle.id)

  // Fetch work orders
  const workOrders = await prisma.workOrder.findMany({
    where: { vehicleId: vehicle.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Fetch ledger events
  const ledgerEvents = await prisma.immutableLedgerEvent.findMany({
    where: { assetId: vehicle.id },
    orderBy: { timestamp: 'desc' },
    take: 20,
    include: {
      actor: {
        select: { name: true },
      },
    },
  })

  // Calculate risk indicators
  const riskIndicators = {
    hasOverdueWorkOrders: workOrders.some(wo => wo.status === 'PENDING' && !wo.completedAt),
    hasRecentIncidents: vehicle.incidents.filter(i => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return new Date(i.incidentDate) > thirtyDaysAgo
    }).length > 0,
    hasExpiredDocuments: false, // Would check compliance documents
    isHighRisk: trustScore ? trustScore.totalScore < 70 : false,
  }

  const getTrustScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-green-500 hover:bg-green-600 text-white border-transparent'
    if (score >= 80) return 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
    if (score >= 70) return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
    if (score >= 60) return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
    return 'bg-red-500 hover:bg-red-600 text-white border-transparent'
  }

  return (
    <div className="space-y-6">
      {/* Header with Risk Badge */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{vehicle.vehicleId}</h1>
              {riskIndicators.isHighRisk && (
                <Badge className="bg-red-500 text-white">High Risk</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/work-orders/new?vehicleId=${vehicle.id}`}>
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Work Order
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Score Card - Prominent */}
      {trustScore && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Asset Trust Score
                </CardTitle>
                <CardDescription>
                  Comprehensive operational trust metric
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge className={`text-3xl px-4 py-2 ${getTrustScoreBadgeClass(trustScore.totalScore)}`}>
                  {trustScore.totalScore}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Last calculated: {format(new Date(trustScore.calculatedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{trustScore.maintenanceScore}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Inspection</p>
                <p className="text-2xl font-bold">{trustScore.inspectionScore}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold">{trustScore.complianceScore}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Incident</p>
                <p className="text-2xl font-bold">{trustScore.incidentScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Indicators */}
      {Object.values(riskIndicators).some(v => v === true) && (
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {riskIndicators.hasOverdueWorkOrders && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Overdue work orders require attention
                </li>
              )}
              {riskIndicators.hasRecentIncidents && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Recent incidents recorded in last 30 days
                </li>
              )}
              {riskIndicators.isHighRisk && (
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Trust score below acceptable threshold (70)
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Vehicle details and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge status={vehicle.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">VIN</p>
                <p className="mt-1 font-mono text-sm">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="mt-1 text-sm">{vehicle.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Division</p>
                <p className="mt-1 text-sm">{vehicle.division || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Odometer</p>
                <p className="mt-1 text-sm">{vehicle.odometer?.toLocaleString() || 'N/A'} miles</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fuel Type</p>
                <p className="mt-1 text-sm">{vehicle.fuelType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Service Date</p>
                <p className="mt-1 text-sm">
                  {vehicle.inServiceDate ? format(new Date(vehicle.inServiceDate), 'PPP') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last DOT Date</p>
                <p className="mt-1 text-sm">
                  {vehicle.lastDOTDate ? format(new Date(vehicle.lastDOTDate), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>
            {vehicle.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm">{vehicle.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Operational metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Vehicle Age</p>
                <p className="text-2xl font-bold">
                  {new Date().getFullYear() - vehicle.year} years
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Incidents</p>
                <p className="text-2xl font-bold">{vehicle.incidents.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Work Orders</p>
                <p className="text-2xl font-bold">{workOrders.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Ledger Events</p>
                <p className="text-2xl font-bold">{ledgerEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Work Orders
              </CardTitle>
              <CardDescription>Maintenance and repair history</CardDescription>
            </div>
            <Link href={`/work-orders/new?vehicleId=${vehicle.id}`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No work orders recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell>{format(new Date(wo.createdAt), 'PP')}</TableCell>
                    <TableCell>{wo.description}</TableCell>
                    <TableCell>
                      <WorkOrderStatusBadge status={wo.status} />
                    </TableCell>
                    <TableCell>{wo.cost ? `$${wo.cost.toLocaleString()}` : 'N/A'}</TableCell>
                    <TableCell>
                      {wo.completedAt ? format(new Date(wo.completedAt), 'PP') : 'Pending'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Immutable Ledger Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit-Ready Timeline
          </CardTitle>
          <CardDescription>
            Cryptographically verified operational history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ledgerEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ledger events recorded</p>
          ) : (
            <div className="space-y-4">
              {ledgerEvents.map((event, index) => {
                const eventData = event.eventData as any
                return (
                  <div
                    key={event.id}
                    className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          event.verificationStatus === 'VERIFIED'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        }`}
                      />
                      {index < ledgerEvents.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {event.eventType.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {eventData?.description || 'No description'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.timestamp), 'PPpp')}
                            {event.actor && ` • ${event.actor.name}`}
                          </p>
                        </div>
                        <Badge
                          variant={
                            event.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'
                          }
                        >
                          {event.verificationStatus}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View hash
                          </summary>
                          <code className="block mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                            {event.eventHash}
                          </code>
                        </details>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
          <CardDescription>Vehicle incident history</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicle.incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicle.incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{format(new Date(incident.incidentDate), 'PP')}</TableCell>
                    <TableCell>{incident.description}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.severity} />
                    </TableCell>
                    <TableCell>
                      {incident.driver
                        ? `${incident.driver.firstName} ${incident.driver.lastName}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
