import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HashDisplay } from './hash-display'
import { LedgerVerificationStatus } from '@prisma/client'
import { Shield, CheckCircle, Clock, XCircle, Anchor } from 'lucide-react'

interface LedgerVerificationCardProps {
  eventHash: string
  previousEventHash: string | null
  verificationStatus: LedgerVerificationStatus
  timestamp: Date
  onVerify?: () => void
}

export function LedgerVerificationCard({
  eventHash,
  previousEventHash,
  verificationStatus,
  timestamp,
  onVerify,
}: LedgerVerificationCardProps) {
  const statusConfig = {
    [LedgerVerificationStatus.VERIFIED]: {
      icon: CheckCircle,
      label: 'Verified',
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      description: 'Event hash verified and chain integrity confirmed',
    },
    [LedgerVerificationStatus.PENDING]: {
      icon: Clock,
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      description: 'Verification in progress',
    },
    [LedgerVerificationStatus.FAILED]: {
      icon: XCircle,
      label: 'Failed',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      description: 'Verification failed - possible tampering detected',
    },
    [LedgerVerificationStatus.ANCHORED]: {
      icon: Anchor,
      label: 'Anchored',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      description: 'Event anchored to external blockchain',
    },
  }

  const config = statusConfig[verificationStatus]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Badge className={`${config.bgColor} hover:${config.bgColor} text-white border-transparent`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <HashDisplay hash={eventHash} label="Event Hash (SHA-256)" />

        {previousEventHash ? (
          <HashDisplay hash={previousEventHash} label="Previous Event Hash" />
        ) : (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Previous Event Hash</div>
            <Badge variant="outline" className="text-xs">
              GENESIS (First Event)
            </Badge>
          </div>
        )}

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Timestamp</div>
          <div className="text-sm">{timestamp.toLocaleString()}</div>
        </div>

        {onVerify && (
          <Button onClick={onVerify} variant="outline" className="w-full" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Re-verify Event
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
