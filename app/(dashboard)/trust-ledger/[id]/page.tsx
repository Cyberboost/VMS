import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LedgerVerificationCard } from '@/components/ledger/ledger-verification-card'
import { getLedgerEventById, verifyLedgerEvent } from '@/lib/actions/ledger'
import { ArrowLeft, Shield } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function LedgerEventDetails({ id }: { id: string }) {
  try {
    const event = await getLedgerEventById(id)

    if (!event) {
      notFound()
    }

    const verification = await verifyLedgerEvent(id)

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Ledger Event Details
            </h1>
            <p className="text-muted-foreground">
              Recorded {format(new Date(event.timestamp), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
          <Link href="/trust-ledger">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ledger
            </Button>
          </Link>
        </div>

        {/* Verification Status */}
        <LedgerVerificationCard
          eventHash={event.eventHash}
          previousEventHash={event.previousEventHash}
          verificationStatus={event.verificationStatus}
          timestamp={new Date(event.timestamp)}
        />

        {/* Event Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Event Type</div>
                <div className="mt-1 font-medium">{event.eventType}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Asset ID</div>
                <div className="mt-1 font-mono text-sm">{event.assetId}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Asset Type</div>
                <div className="mt-1">{event.assetType}</div>
              </div>

              {event.actorUserId && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Actor User ID</div>
                  <div className="mt-1 font-mono text-sm">{event.actorUserId}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blockchain Anchoring</CardTitle>
              <CardDescription>External blockchain verification (future)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.blockchainTxHash ? (
                <>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Transaction Hash</div>
                    <div className="mt-1 font-mono text-xs break-all">{event.blockchainTxHash}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Network</div>
                    <div className="mt-1">{event.blockchainNetwork || 'Unknown'}</div>
                  </div>
                  {event.anchoredAt && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Anchored At</div>
                      <div className="mt-1">
                        {format(new Date(event.anchoredAt), 'MMMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  This event has not been anchored to an external blockchain network yet.
                  Blockchain anchoring provides additional immutability guarantees through
                  decentralized consensus.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Data */}
        <Card>
          <CardHeader>
            <CardTitle>Event Data</CardTitle>
            <CardDescription>Cryptographically hashed event payload</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(event.eventData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Metadata */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>Additional event context</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Verification Result */}
        {!verification.isValid && (
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Verification Failed</CardTitle>
              <CardDescription className="text-red-700">
                This event failed verification checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-800">
                <strong>Reason:</strong> {verification.reason || 'Unknown'}
              </div>
              <div className="mt-4 text-sm text-red-700">
                A failed verification may indicate data tampering or corruption.
                Contact your system administrator immediately.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    notFound()
  }
}

export default async function LedgerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense fallback={<div className="py-8">Loading ledger event...</div>}>
      <LedgerEventDetails id={id} />
    </Suspense>
  )
}
