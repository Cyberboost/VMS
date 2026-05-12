import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Wrench,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  Shield,
  Package,
  Activity,
} from 'lucide-react'

interface TrustScoreBreakdown {
  maintenanceScore?: number
  inspectionScore?: number
  complianceScore?: number
  incidentScore?: number
  verificationScore?: number
  partsScore?: number
  downtimeScore?: number
}

interface TrustScoreBreakdownProps {
  breakdown: TrustScoreBreakdown
}

export function TrustScoreBreakdown({ breakdown }: TrustScoreBreakdownProps) {
  const components = [
    {
      name: 'Maintenance',
      score: breakdown.maintenanceScore,
      weight: 20,
      icon: Wrench,
      description: 'Work order completion & timeliness',
    },
    {
      name: 'Inspection',
      score: breakdown.inspectionScore,
      weight: 20,
      icon: ClipboardCheck,
      description: 'Inspection pass rate & frequency',
    },
    {
      name: 'Compliance',
      score: breakdown.complianceScore,
      weight: 20,
      icon: FileCheck,
      description: 'Document validity & compliance status',
    },
    {
      name: 'Incident',
      score: breakdown.incidentScore,
      weight: 15,
      icon: AlertTriangle,
      description: 'Incident frequency & severity',
    },
    {
      name: 'Verification',
      score: breakdown.verificationScore,
      weight: 15,
      icon: Shield,
      description: 'Ledger event verification rate',
    },
    {
      name: 'Parts',
      score: breakdown.partsScore,
      weight: 5,
      icon: Package,
      description: 'Part quality & traceability',
    },
    {
      name: 'Downtime',
      score: breakdown.downtimeScore,
      weight: 5,
      icon: Activity,
      description: 'Asset availability & uptime',
    },
  ]

  const getScoreColor = (score: number | undefined): string => {
    if (score === undefined) return 'bg-gray-400'
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trust Score Breakdown</CardTitle>
        <CardDescription>
          7-component weighted algorithm analyzing operational history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {components.map((component) => {
            const Icon = component.icon
            const score = component.score ?? 0

            return (
              <div key={component.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{component.name}</span>
                    <span className="text-xs text-muted-foreground">({component.weight}%)</span>
                  </div>
                  <span className="text-sm font-bold">{component.score !== undefined ? score : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getScoreColor(component.score)}`}
                        style={{ width: `${component.score !== undefined ? score : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{component.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="text-xs text-muted-foreground">
            <strong>Calculation:</strong> Each component is scored 0-100, then weighted and combined to produce
            the overall trust score. Higher scores indicate better operational reliability and compliance.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
