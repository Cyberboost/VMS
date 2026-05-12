import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, TrendingUp, TrendingDown } from 'lucide-react'

interface AssetTrustScoreCardProps {
  score: number
  lastCalculated: Date
  showDetails?: boolean
}

export function AssetTrustScoreCard({ score, lastCalculated, showDetails = true }: AssetTrustScoreCardProps) {
  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Watch'
    if (score >= 60) return 'Risk'
    return 'Critical'
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 90) return 'bg-green-500 hover:bg-green-600 text-white border-transparent'
    if (score >= 80) return 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
    if (score >= 70) return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
    if (score >= 60) return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
    return 'bg-red-500 hover:bg-red-600 text-white border-transparent'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const scoreLabel = getScoreLabel(score)
  const scoreColor = getScoreColor(score)
  const badgeColor = getScoreBadgeColor(score)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Asset Trust Score
          </CardTitle>
          <Badge className={badgeColor}>
            {getScoreIcon(score)}
            <span className="ml-1">{scoreLabel}</span>
          </Badge>
        </div>
        <CardDescription>
          Comprehensive operational trust metric
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Big Score Display */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${scoreColor}`}>{score}</div>
            <div className="text-sm text-muted-foreground mt-2">out of 100</div>
          </div>

          {/* Score Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                score >= 90
                  ? 'bg-green-500'
                  : score >= 80
                    ? 'bg-blue-500'
                    : score >= 70
                      ? 'bg-yellow-500'
                      : score >= 60
                        ? 'bg-orange-500'
                        : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          {showDetails && (
            <div className="text-xs text-muted-foreground text-center">
              Last calculated: {lastCalculated.toLocaleDateString()} at{' '}
              {lastCalculated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
