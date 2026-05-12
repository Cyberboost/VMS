import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Car,
  CheckCircle,
  AlertTriangle,
  Shield,
  Wrench,
  ClipboardCheck,
  TrendingUp,
  Activity,
} from 'lucide-react'

export default function DashboardPage() {
  // Mock data for KPIs
  const kpis = {
    totalAssets: 1247,
    activeAssets: 1102,
    avgTrustScore: 87,
    openWorkOrders: 12,
    overdueCompliance: 8,
    verifiedEvents: 2847,
  }

  // Mock data for Asset Trust Scores
  const assetTrustHighlights = [
    {
      id: 'VEH-2847',
      name: 'Bucket Truck BT-42',
      type: 'Utility Truck',
      trustScore: 95,
      status: 'Excellent' as const,
      lastVerified: 'Feb 11, 2026',
    },
    {
      id: 'VEH-1523',
      name: 'Service Van SV-18',
      type: 'Service Vehicle',
      trustScore: 88,
      status: 'Good' as const,
      lastVerified: 'Feb 10, 2026',
    },
    {
      id: 'VEH-3891',
      name: 'Emergency Response ER-07',
      type: 'Emergency Vehicle',
      trustScore: 72,
      status: 'Fair' as const,
      lastVerified: 'Feb 9, 2026',
    },
    {
      id: 'VEH-4102',
      name: 'Generator Trailer GT-15',
      type: 'Generator',
      trustScore: 91,
      status: 'Excellent' as const,
      lastVerified: 'Feb 8, 2026',
    },
    {
      id: 'VEH-2156',
      name: 'Pickup Truck PT-22',
      type: 'Utility Vehicle',
      trustScore: 65,
      status: 'Attention Needed' as const,
      lastVerified: 'Feb 7, 2026',
    },
  ]

  // Recent Immutable Events
  const recentEvents = [
    {
      id: 'EVT-001',
      assetId: 'VEH-2847',
      eventType: 'INSPECTION_COMPLETED',
      description: 'Annual DOT inspection passed',
      timestamp: 'Feb 11, 2026 10:45 AM',
      status: 'Verified' as const,
    },
    {
      id: 'EVT-002',
      assetId: 'VEH-1523',
      eventType: 'OIL_CHANGE',
      description: 'Routine oil change completed',
      timestamp: 'Feb 10, 2026 2:30 PM',
      status: 'Verified' as const,
    },
    {
      id: 'EVT-003',
      assetId: 'VEH-3891',
      eventType: 'BRAKE_REPLACEMENT',
      description: 'Front brake pads replaced',
      timestamp: 'Feb 10, 2026 11:15 AM',
      status: 'Verified' as const,
    },
    {
      id: 'EVT-004',
      assetId: 'VEH-4102',
      eventType: 'COMPLIANCE_DOCUMENT_UPLOADED',
      description: 'Insurance certificate renewed',
      timestamp: 'Feb 9, 2026 4:20 PM',
      status: 'Pending' as const,
    },
  ]

  // Trust score badge styling
  const getTrustScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-green-500 hover:bg-green-600 text-white border-transparent'
    if (score >= 80) return 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
    if (score >= 70) return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
    if (score >= 60) return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
    return 'bg-red-500 hover:bg-red-600 text-white border-transparent'
  }

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-500 hover:bg-green-600 text-white border-transparent'
      case 'Pending':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operational Trust Dashboard</h1>
        <p className="text-muted-foreground">
          Verifiable, compliant, and predictive fleet intelligence
        </p>
      </div>

      {/* KPI Grid - 6 cards in a responsive row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Fleet & infrastructure</p>
          </CardContent>
        </Card>

        {/* Active Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.activeAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently operational</p>
          </CardContent>
        </Card>

        {/* Average Trust Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.avgTrustScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Fleet-wide average</p>
          </CardContent>
        </Card>

        {/* Open Work Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpis.openWorkOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending maintenance</p>
          </CardContent>
        </Card>

        {/* Overdue Compliance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.overdueCompliance}</div>
            <p className="text-xs text-muted-foreground mt-1">Items overdue</p>
          </CardContent>
        </Card>

        {/* Verified Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{kpis.verifiedEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Immutable ledger</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Asset Trust Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Trust Scores</CardTitle>
          <CardDescription>
            Real-time operational trust metrics for critical assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Asset ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Trust Score
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Last Verified
                  </th>
                </tr>
              </thead>
              <tbody>
                {assetTrustHighlights.map((asset) => (
                  <tr key={asset.id} className="border-b last:border-0">
                    <td className="py-3 px-4 text-sm font-medium">{asset.id}</td>
                    <td className="py-3 px-4 text-sm">{asset.name}</td>
                    <td className="py-3 px-4 text-sm">{asset.type}</td>
                    <td className="py-3 px-4">
                      <Badge className={getTrustScoreBadgeClass(asset.trustScore)}>
                        {asset.trustScore}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{asset.status}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {asset.lastVerified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section - Two-column responsive grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: Recent Immutable Events (spans 3 cols) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Immutable Events</CardTitle>
              <CardDescription>Latest verified operational activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Asset ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Event
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Timestamp
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="border-b last:border-0">
                        <td className="py-3 px-4 text-sm font-medium">{event.assetId}</td>
                        <td className="py-3 px-4 text-sm">{event.description}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {event.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadgeClass(event.status)}>
                            {event.status}
                          </Badge>
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
              <CardDescription>Common operational tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/vehicles" className="block">
                <Button variant="default" className="w-full justify-start">
                  <Car className="h-4 w-4 mr-2" />
                  View Fleet Registry
                </Button>
              </Link>
              <Link href="/work-orders" className="block">
                <Button variant="default" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Manage Work Orders
                </Button>
              </Link>
              <Link href="/inspections" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Schedule Inspection
                </Button>
              </Link>
              <Link href="/compliance" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Compliance Alerts
                </Button>
              </Link>
              <Link href="/ledger" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Trust Ledger
                </Button>
              </Link>
              <Link href="/reports" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
