export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { VehicleStatus } from '@prisma/client'

async function getReportData() {
  const [
    totalVehicles,
    vehiclesByStatus,
    vehiclesByDepartment,
    avgVehicleAge,
    totalIncidents,
    replacementsDue,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.vehicle.groupBy({
      by: ['department'],
      _count: true,
      orderBy: { _count: { department: 'desc' } },
    }),
    prisma.vehicle.aggregate({
      _avg: { year: true },
    }),
    prisma.incident.count(),
    prisma.vehicle.count({
      where: {
        replacementTargetYear: {
          lte: new Date().getFullYear() + 1,
        },
      },
    }),
  ])

  const currentYear = new Date().getFullYear()
  const avgAge = avgVehicleAge._avg.year ? currentYear - avgVehicleAge._avg.year : 0

  return {
    totalVehicles,
    vehiclesByStatus,
    vehiclesByDepartment,
    avgVehicleAge: Math.round(avgAge),
    totalIncidents,
    replacementsDue,
  }
}

export default async function ReportsPage() {
  const data = await getReportData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Fleet analytics and reporting</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Summary</CardTitle>
            <CardDescription>Overall fleet statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Vehicles</span>
                <span className="text-2xl font-bold">{data.totalVehicles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Vehicle Age</span>
                <span className="text-2xl font-bold">{data.avgVehicleAge} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Incidents</span>
                <span className="text-2xl font-bold">{data.totalIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Replacements Due</span>
                <span className="text-2xl font-bold">{data.replacementsDue}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Justification</CardTitle>
            <CardDescription>Fleet replacement and maintenance needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Vehicles Requiring Replacement</p>
                <p className="text-2xl font-bold text-orange-600">{data.replacementsDue}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Target year: {new Date().getFullYear()} or earlier
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Fleet Age Analysis</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Average fleet age is {data.avgVehicleAge} years. Industry standard recommends
                  replacement every 8-10 years for optimal efficiency.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Incident Impact</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.totalIncidents} incidents recorded. Regular maintenance and timely
                  replacements can reduce incident rates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles by Status</CardTitle>
          <CardDescription>Fleet status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.vehiclesByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.status}</span>
                <span className="text-lg font-bold">{item._count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles by Department</CardTitle>
          <CardDescription>Fleet distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.vehiclesByDepartment.map((item) => (
              <div key={item.department} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.department}</span>
                <span className="text-lg font-bold">{item._count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
