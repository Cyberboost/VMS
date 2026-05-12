'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, X } from 'lucide-react'
import { completeWorkOrder } from '@/lib/actions/work-orders'
import { updateAssetTrustScore } from '@/lib/trust-score'

export function CompleteWorkOrderForm({ workOrderId }: { workOrderId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const workOrder = await completeWorkOrder(workOrderId, {
        cost: cost ? parseFloat(cost) : undefined,
        notes,
      })

      // Trigger trust score recalculation in background
      updateAssetTrustScore(workOrder.vehicleId).catch(console.error)

      setShowForm(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to complete work order:', error)
      alert('Failed to complete work order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 max-w-md w-full m-4">
          <form onSubmit={handleComplete}>
            <h2 className="text-xl font-bold mb-4">Complete Work Order</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This will generate an immutable ledger event and update the asset's trust score.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cost">Total Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notes">Completion Notes</Label>
                <textarea
                  id="notes"
                  placeholder="Enter any notes about the completed work..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Completing...' : 'Complete Work Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={() => setShowForm(true)}>
      <CheckCircle className="h-4 w-4 mr-2" />
      Complete Work Order
    </Button>
  )
}
