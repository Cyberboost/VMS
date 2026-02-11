export const dynamic = 'force-dynamic'

import { getDashboardKPIs, getRecentActivity } from '@/lib/actions/dashboard'
import { getSessionOrgContext } from '@/lib/auth-utils'
import { KPICard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Car,
  Wrench,
  AlertTriangle,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  Activity,
} from 'lucide-react'

export default async function DashboardPage() {
  const context = await getSessionOrgContext()

  if (!context?.orgId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Please set up an organization to view the dashboard</p>
      </div>
    )
  }

  const { kpis, fleetRiskScore, vehicleStats, incidentStats } = await getDashboardKPIs(
    context.orgId
  )
  const recentActivity = await getRecentActivity(context.orgId, 10)

  // Determine risk score color
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (direction?: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (direction === 'down') return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Fleet Intelligence &amp; Accountability — City of Atlanta
        </p>
      </div>

      {/* Fleet Risk Score - Prominent Display */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Fleet Risk Score</CardTitle>
              <CardDescription>{kpis.fleetRiskScore.description}</CardDescription>
            </div>
            <div className={`text-6xl font-bold ${getRiskScoreColor(fleetRiskScore.score)}`}>
              {fleetRiskScore.score}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Compliance</span>
                <span className="font-bold">{fleetRiskScore.complianceScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${fleetRiskScore.complianceScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">40% weight</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Maintenance</span>
                <span className="font-bold">{fleetRiskScore.maintenanceScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-600 transition-all"
                  style={{ width: `${fleetRiskScore.maintenanceScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">30% weight</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Incidents</span>
                <span className="font-bold">{fleetRiskScore.incidentScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-600 transition-all"
                  style={{ width: `${fleetRiskScore.incidentScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">30% weight</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary KPIs - 3x2 Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpis.openComplianceIssues.label}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{kpis.openComplianceIssues.value}</div>
              {getTrendIcon(kpis.openComplianceIssues.trend?.direction)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.openComplianceIssues.description}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpis.accidents30Days.label}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.accidents30Days.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.accidents30Days.description}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpis.repeatOperators.label}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.repeatOperators.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.repeatOperators.description}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpis.pmOverdue.label}</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{kpis.pmOverdue.value}</div>
              {getTrendIcon(kpis.pmOverdue.trend?.direction)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{kpis.pmOverdue.description}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpis.surplusPipeline.label}</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.surplusPipeline.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.surplusPipeline.description}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpis.budgetReadiness.label}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.budgetReadiness.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.budgetReadiness.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Info - Fleet Stats & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Overview</CardTitle>
            <CardDescription>Current fleet status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Vehicles</span>
                <span className="text-sm font-bold">{vehicleStats.totalVehicles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Service</span>
                <span className="text-sm font-bold text-green-600">
                  {vehicleStats.inServiceVehicles}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Repair</span>
                <span className="text-sm font-bold text-yellow-600">
                  {vehicleStats.inRepairVehicles}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Out of Service</span>
                <span className="text-sm font-bold text-red-600">
                  {vehicleStats.outOfServiceVehicles}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Fleet Availability</span>
                <span className="text-sm font-bold">
                  {vehicleStats.totalVehicles > 0
                    ? Math.round((vehicleStats.inServiceVehicles / vehicleStats.totalVehicles) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        {log.action} {log.entityType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.actor?.name || 'System'} • {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
