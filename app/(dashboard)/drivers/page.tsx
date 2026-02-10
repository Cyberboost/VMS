export const dynamic = 'force-dynamic'

import { getDrivers } from '@/lib/actions/driver-actions'
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

export default async function DriversPage() {
  const drivers = await getDrivers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage fleet drivers</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>CDL Number</TableHead>
                <TableHead>CDL Expiration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Incidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No drivers found
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.driverId}</TableCell>
                    <TableCell>
                      {driver.firstName} {driver.lastName}
                    </TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.phone || 'N/A'}</TableCell>
                    <TableCell>{driver.department}</TableCell>
                    <TableCell className="font-mono text-xs">{driver.cdlNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {driver.cdlExpiration ? format(new Date(driver.cdlExpiration), 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={driver.status} />
                    </TableCell>
                    <TableCell>{driver._count.incidents}</TableCell>
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
