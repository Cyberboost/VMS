import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Car,
  CheckCircle,
  AlertTriangle,
  Package,
  Plus,
  FileText,
  Inbox,
} from 'lucide-react'

export default function DashboardPage() {
  // Mock data for KPIs
  const kpis = {
    totalVehicles: 1247,
    activeVehicles: 1102,
    openIncidents: 23,
    pendingSurplus: 8,
  }

  // Mock data for Recent Incidents
  const recentIncidents = [
    {
      id: 'INC-001',
      vehicle: 'VH-2847',
      description: 'Engine warning light activated during route',
      severity: 'Critical' as const,
      status: 'Open' as const,
      date: 'Feb 11, 2026',
    },
    {
      id: 'INC-002',
      vehicle: 'VH-1523',
      description: 'Minor collision in parking lot',
      severity: 'Medium' as const,
      status: 'Under Review' as const,
      date: 'Feb 10, 2026',
    },
    {
      id: 'INC-003',
      vehicle: 'VH-3891',
      description: 'Brake system maintenance required',
      severity: 'High' as const,
      status: 'Action Required' as const,
      date: 'Feb 10, 2026',
    },
    {
      id: 'INC-004',
      vehicle: 'VH-4102',
      description: 'Tire pressure sensor malfunction',
      severity: 'Low' as const,
      status: 'Open' as const,
      date: 'Feb 9, 2026',
    },
    {
      id: 'INC-005',
      vehicle: 'VH-2156',
      description: 'Windshield chip needs repair',
      severity: 'Low' as const,
      status: 'Under Review' as const,
      date: 'Feb 9, 2026',
    },
  ]

  // Severity badge styling
  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500 hover:bg-red-600 text-white border-transparent'
      case 'High':
        return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
      case 'Medium':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
      case 'Low':
        return 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
      default:
        return ''
    }
  }

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
      case 'Under Review':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
      case 'Action Required':
        return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fleet Overview</h1>
        <p className="text-muted-foreground">
          Real-time fleet intelligence &amp; accountability dashboard
        </p>
      </div>

      {/* KPI Grid - 4 cards in a responsive row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalVehicles}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
          </CardContent>
        </Card>

        {/* Active Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.activeVehicles}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in service</p>
          </CardContent>
        </Card>

        {/* Open Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.openIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">+3 since last week</p>
          </CardContent>
        </Card>

        {/* Pending Surplus Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Surplus Requests</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.pendingSurplus}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Two-column responsive grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: Recent Incidents Table (spans 3 cols) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Latest reported fleet incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Severity
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map((incident) => (
                      <tr key={incident.id} className="border-b last:border-0">
                        <td className="py-3 px-4 text-sm font-medium">{incident.id}</td>
                        <td className="py-3 px-4 text-sm">{incident.vehicle}</td>
                        <td className="py-3 px-4 text-sm">{incident.description}</td>
                        <td className="py-3 px-4">
                          <Badge className={getSeverityBadgeClass(incident.severity)}>
                            {incident.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadgeClass(incident.status)}>
                            {incident.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {incident.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Actions Card (spans 2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common fleet management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/vehicles/new" className="block">
                <Button variant="default" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </Link>
              <Link href="/incidents/new" className="block">
                <Button variant="default" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Log Incident
                </Button>
              </Link>
              <Link href="/surplus/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Create Surplus Request
                </Button>
              </Link>
              <Link href="/reports" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Empty State Placeholder — activate when no data is available */}
      {false && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              Fleet data will appear here once connected.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
