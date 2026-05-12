import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkOrderTable } from '@/components/work-orders/work-order-table'
import { listWorkOrders } from '@/lib/actions/work-orders'
import { requireAuth } from '@/lib/auth-utils'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function WorkOrdersList() {
  const context = await requireAuth()

  if (!context.orgId) {
    return <div>No organization found</div>
  }

  const { workOrders } = await listWorkOrders(context.orgId)

  return <WorkOrderTable workOrders={workOrders} />
}

export default async function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage maintenance and repair work orders
          </p>
        </div>
        <Link href="/work-orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </Link>
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
          <CardDescription>
            View and manage work orders across your fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-8 text-center">Loading work orders...</div>}>
            <WorkOrdersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
