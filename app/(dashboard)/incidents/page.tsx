export const dynamic = 'force-dynamic'

import { getIncidents } from '@/lib/actions/incident-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

export default async function IncidentsPage() {
  const incidents = await getIncidents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">Track and manage fleet incidents</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>At Fault</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No incidents found
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{format(new Date(incident.incidentDate), 'PP')}</TableCell>
                    <TableCell className="font-medium">{incident.vehicle.vehicleId}</TableCell>
                    <TableCell>
                      {incident.driver
                        ? `${incident.driver.firstName} ${incident.driver.lastName}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.severity} />
                    </TableCell>
                    <TableCell>{incident.department}</TableCell>
                    <TableCell>{incident.atFault ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
