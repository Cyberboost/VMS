import { notFound } from 'next/navigation'
import { getVehicleById } from '@/lib/actions/vehicle-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Edit, AlertTriangle, Archive } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const vehicle = await getVehicleById(params.id)

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vehicle.vehicleId}</h1>
            <p className="text-muted-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Vehicle
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="mr-2 h-4 w-4" />
              Start Surplus Request
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Vehicle details and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge status={vehicle.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">VIN</p>
                <p className="mt-1 font-mono text-sm">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="mt-1 text-sm">{vehicle.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Division</p>
                <p className="mt-1 text-sm">{vehicle.division || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Odometer</p>
                <p className="mt-1 text-sm">{vehicle.odometer?.toLocaleString() || 'N/A'} miles</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fuel Type</p>
                <p className="mt-1 text-sm">{vehicle.fuelType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Service Date</p>
                <p className="mt-1 text-sm">
                  {vehicle.inServiceDate ? format(new Date(vehicle.inServiceDate), 'PPP') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last DOT Date</p>
                <p className="mt-1 text-sm">
                  {vehicle.lastDOTDate ? format(new Date(vehicle.lastDOTDate), 'PPP') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Replacement Target Year</p>
                <p className="mt-1 text-sm">{vehicle.replacementTargetYear || 'N/A'}</p>
              </div>
            </div>
            {vehicle.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm">{vehicle.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance & Compliance</CardTitle>
            <CardDescription>Service and inspection information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Last DOT Inspection</p>
                <p className="text-2xl font-bold">
                  {vehicle.lastDOTDate ? format(new Date(vehicle.lastDOTDate), 'MMM d, yyyy') : 'Not recorded'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Vehicle Age</p>
                <p className="text-2xl font-bold">
                  {new Date().getFullYear() - vehicle.year} years
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Incidents Count</p>
                <p className="text-2xl font-bold">{vehicle.incidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
          <CardDescription>Vehicle incident history</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicle.incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicle.incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{format(new Date(incident.incidentDate), 'PP')}</TableCell>
                    <TableCell>{incident.description}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.severity} />
                    </TableCell>
                    <TableCell>
                      {incident.driver
                        ? `${incident.driver.firstName} ${incident.driver.lastName}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Surplus Requests</CardTitle>
          <CardDescription>Vehicle surplus history</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicle.surplusRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No surplus requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicle.surplusRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{format(new Date(request.createdAt), 'PP')}</TableCell>
                    <TableCell>{request.condition}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>{request.requester.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
