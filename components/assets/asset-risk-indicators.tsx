import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface AssetRiskIndicatorsProps {
  overallScore: number
  maintenanceScore?: number
  inspectionScore?: number
  complianceScore?: number
  incidentScore?: number
}

interface RiskIndicator {
  level: 'critical' | 'warning' | 'info' | 'success'
  title: string
  message: string
}

export function AssetRiskIndicators({
  overallScore,
  maintenanceScore,
  inspectionScore,
  complianceScore,
  incidentScore,
}: AssetRiskIndicatorsProps) {
  const risks: RiskIndicator[] = []
  const recommendations: string[] = []

  // Overall score assessment
  if (overallScore < 60) {
    risks.push({
      level: 'critical',
      title: 'Critical Trust Score',
      message: 'Asset requires immediate attention. Consider taking out of service.',
    })
    recommendations.push('Schedule comprehensive inspection')
    recommendations.push('Review complete maintenance history')
    recommendations.push('Consider asset replacement evaluation')
  } else if (overallScore < 70) {
    risks.push({
      level: 'warning',
      title: 'Low Trust Score',
      message: 'Asset operational reliability is concerning. Increased monitoring recommended.',
    })
    recommendations.push('Increase inspection frequency')
    recommendations.push('Address deferred maintenance')
  }

  // Maintenance assessment
  if (maintenanceScore !== undefined && maintenanceScore < 70) {
    risks.push({
      level: maintenanceScore < 50 ? 'critical' : 'warning',
      title: 'Maintenance Issues',
      message: 'Poor maintenance completion rate or overdue work orders detected.',
    })
    recommendations.push('Complete all pending work orders')
    recommendations.push('Review maintenance schedule adherence')
  }

  // Inspection assessment
  if (inspectionScore !== undefined && inspectionScore < 70) {
    risks.push({
      level: inspectionScore < 50 ? 'critical' : 'warning',
      title: 'Inspection Concerns',
      message: 'Multiple failed inspections or insufficient inspection frequency.',
    })
    recommendations.push('Schedule immediate safety inspection')
    recommendations.push('Address all failed inspection items')
  }

  // Compliance assessment
  if (complianceScore !== undefined && complianceScore < 80) {
    risks.push({
      level: complianceScore < 60 ? 'critical' : 'warning',
      title: 'Compliance Gaps',
      message: 'Expired documents or critical compliance violations detected.',
    })
    recommendations.push('Renew expired compliance documents')
    recommendations.push('Address critical compliance issues immediately')
  }

  // Incident assessment
  if (incidentScore !== undefined && incidentScore < 70) {
    risks.push({
      level: incidentScore < 50 ? 'critical' : 'warning',
      title: 'Incident History',
      message: 'High frequency or severity of incidents for this asset.',
    })
    recommendations.push('Conduct incident pattern analysis')
    recommendations.push('Consider operator retraining')
  }

  // Add success indicators if score is good
  if (overallScore >= 90 && risks.length === 0) {
    risks.push({
      level: 'success',
      title: 'Excellent Operational Trust',
      message: 'Asset demonstrates strong reliability and compliance.',
    })
    recommendations.push('Continue current maintenance schedule')
    recommendations.push('Document best practices for fleet-wide adoption')
  } else if (overallScore >= 80 && risks.length === 0) {
    risks.push({
      level: 'info',
      title: 'Good Operational Standing',
      message: 'Asset performing well with minor opportunities for improvement.',
    })
    recommendations.push('Maintain current inspection frequency')
  }

  const getLevelConfig = (level: RiskIndicator['level']) => {
    switch (level) {
      case 'critical':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badgeClass: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badgeClass: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent',
        }
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badgeClass: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
        }
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          badgeClass: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
        }
    }
  }

  return (
    <div className="space-y-4">
      {/* Risk Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {risks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No specific risk indicators detected.
            </div>
          ) : (
            risks.map((risk, index) => {
              const config = getLevelConfig(risk.level)
              const Icon = config.icon

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${config.iconColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{risk.title}</span>
                        <Badge className={config.badgeClass} variant="outline">
                          {risk.level.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.message}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
