export const dynamic = "force-dynamic"

import { prisma } from '@/lib/db'
import { KPICard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Car,
  Wrench,
  AlertTriangle,
  Calendar,
  IdCard,
  XCircle,
} from 'lucide-react'
import { VehicleStatus, IncidentStatus } from '@prisma/client'
import { subDays } from 'date-fns'

async function getDashboardData() {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  const [
    totalVehicles,
    inServiceVehicles,
    inRepairVehicles,
    outOfServiceVehicles,
    recentIncidents,
    dotDueSoon,
    cdlExpiringSoon,
    recentActivity,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: VehicleStatus.InService } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.InRepair } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.OutOfService } }),
    prisma.incident.count({
      where: {
        incidentDate: { gte: thirtyDaysAgo },
      },
    }),
    prisma.vehicle.count({
      where: {
        lastDOTDate: {
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.driver.count({
      where: {
        cdlExpiration: {
          lte: sixtyDaysFromNow,
          gte: now,
        },
      },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    }),
  ])

  return {
    totalVehicles,
    inServiceVehicles,
    inRepairVehicles,
    outOfServiceVehicles,
    recentIncidents,
    dotDueSoon,
    cdlExpiringSoon,
    recentActivity,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Fleet management overview and key metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Vehicles"
          value={data.totalVehicles}
          icon={Car}
          description="Active fleet size"
        />
        <KPICard
          title="In Service"
          value={data.inServiceVehicles}
          icon={Car}
          description="Currently operational"
        />
        <KPICard
          title="In Repair"
          value={data.inRepairVehicles}
          icon={Wrench}
          description="Under maintenance"
        />
        <KPICard
          title="Out of Service"
          value={data.outOfServiceVehicles}
          icon={XCircle}
          description="Non-operational"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Incidents (30 days)"
          value={data.recentIncidents}
          icon={AlertTriangle}
          description="Recent incidents"
        />
        <KPICard
          title="DOT Due (30 days)"
          value={data.dotDueSoon}
          icon={Calendar}
          description="Inspections needed soon"
        />
        <KPICard
          title="CDL Expiring (60 days)"
          value={data.cdlExpiringSoon}
          icon={IdCard}
          description="Driver licenses expiring"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        {log.action} {log.entityType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {log.actor.name} • {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Fleet performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fleet Availability</span>
                <span className="text-sm font-bold">
                  {data.totalVehicles > 0
                    ? Math.round((data.inServiceVehicles / data.totalVehicles) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vehicles in Maintenance</span>
                <span className="text-sm font-bold">
                  {data.totalVehicles > 0
                    ? Math.round((data.inRepairVehicles / data.totalVehicles) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vehicles Out of Service</span>
                <span className="text-sm font-bold">
                  {data.totalVehicles > 0
                    ? Math.round((data.outOfServiceVehicles / data.totalVehicles) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
