import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkOrderForm } from '@/components/work-orders/work-order-form'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function VehicleSelector({ searchParams }: { searchParams: any }) {
  const context = await requireAuth()

  if (!context.orgId) {
    redirect('/')
  }

  const vehicleId = searchParams.vehicleId

  // If vehicleId is provided, fetch vehicle details
  let vehicle = null
  if (vehicleId) {
    vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        vehicleId: true,
        make: true,
        model: true,
        year: true,
      },
    })
  }

  // If no vehicle specified, fetch all vehicles for selection
  if (!vehicle) {
    const vehicles = await prisma.vehicle.findMany({
      where: { orgId: context.orgId },
      select: {
        id: true,
        vehicleId: true,
        make: true,
        model: true,
        year: true,
      },
      orderBy: { vehicleId: 'asc' },
      take: 100,
    })

    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Vehicle</CardTitle>
          <CardDescription>
            Choose a vehicle to create a work order for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {vehicles.map((v) => (
              <a
                key={v.id}
                href={`/work-orders/new?vehicleId=${v.id}`}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">{v.vehicleId}</div>
                <div className="text-sm text-muted-foreground">
                  {v.year} {v.make} {v.model}
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const vehicleName = `${vehicle.vehicleId} - ${vehicle.year} ${vehicle.make} ${vehicle.model}`

  return <WorkOrderForm vehicleId={vehicle.id} vehicleName={vehicleName} />
}

export default async function NewWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string }>
}) {
  const params = await searchParams

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Work Order</h1>
        <p className="text-muted-foreground">
          Create a new maintenance or repair work order
        </p>
      </div>

      <Suspense fallback={<div className="py-8">Loading...</div>}>
        <VehicleSelector searchParams={params} />
      </Suspense>
    </div>
  )
}
