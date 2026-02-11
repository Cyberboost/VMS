import { Badge } from './badge'
import {
  VehicleStatus,
  DriverStatus,
  IncidentStatus,
  SurplusStatus,
  IncidentSeverity,
} from '@prisma/client'

type StatusType = VehicleStatus | DriverStatus | IncidentStatus | SurplusStatus | IncidentSeverity

interface StatusBadgeProps {
  status: StatusType
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariantAndLabel = () => {
    // Vehicle Status
    if (status === VehicleStatus.InService) {
      return {
        variant: 'default' as const,
        label: 'In Service',
        className: 'bg-green-500 hover:bg-green-600',
      }
    }
    if (status === VehicleStatus.InRepair) {
      return {
        variant: 'default' as const,
        label: 'In Repair',
        className: 'bg-yellow-500 hover:bg-yellow-600',
      }
    }
    if (status === VehicleStatus.OutOfService) {
      return { variant: 'destructive' as const, label: 'Out of Service' }
    }
    if (status === VehicleStatus.Surplus) {
      return { variant: 'secondary' as const, label: 'Surplus' }
    }
    if (status === VehicleStatus.PENDING_SURPLUS) {
      return {
        variant: 'default' as const,
        label: 'Pending Surplus',
        className: 'bg-orange-500 hover:bg-orange-600',
      }
    }
    if (status === VehicleStatus.Decommissioned) {
      return { variant: 'outline' as const, label: 'Decommissioned' }
    }

    // Driver Status
    if (status === DriverStatus.Active) {
      return {
        variant: 'default' as const,
        label: 'Active',
        className: 'bg-green-500 hover:bg-green-600',
      }
    }
    if (status === DriverStatus.Inactive) {
      return { variant: 'secondary' as const, label: 'Inactive' }
    }
    if (status === DriverStatus.Suspended) {
      return { variant: 'destructive' as const, label: 'Suspended' }
    }

    // Incident Status - Updated for new enums
    if (status === IncidentStatus.OPEN) {
      return {
        variant: 'default' as const,
        label: 'Open',
        className: 'bg-blue-500 hover:bg-blue-600',
      }
    }
    if (status === IncidentStatus.UNDER_REVIEW) {
      return {
        variant: 'default' as const,
        label: 'Under Review',
        className: 'bg-yellow-500 hover:bg-yellow-600',
      }
    }
    if (status === IncidentStatus.ACTION_REQUIRED) {
      return {
        variant: 'default' as const,
        label: 'Action Required',
        className: 'bg-orange-500 hover:bg-orange-600',
      }
    }
    if (status === IncidentStatus.CLOSED) {
      return { variant: 'secondary' as const, label: 'Closed' }
    }

    // Incident Severity
    if (status === IncidentSeverity.Low) {
      return {
        variant: 'default' as const,
        label: 'Low',
        className: 'bg-blue-500 hover:bg-blue-600',
      }
    }
    if (status === IncidentSeverity.Medium) {
      return {
        variant: 'default' as const,
        label: 'Medium',
        className: 'bg-yellow-500 hover:bg-yellow-600',
      }
    }
    if (status === IncidentSeverity.High) {
      return {
        variant: 'default' as const,
        label: 'High',
        className: 'bg-orange-500 hover:bg-orange-600',
      }
    }
    if (status === IncidentSeverity.Critical) {
      return { variant: 'destructive' as const, label: 'Critical' }
    }

    // Surplus Status
    if (status === SurplusStatus.PENDING_REVIEW) {
      return {
        variant: 'default' as const,
        label: 'Pending Review',
        className: 'bg-yellow-500 hover:bg-yellow-600',
      }
    }
    if (status === SurplusStatus.PENDING_APPROVAL) {
      return {
        variant: 'default' as const,
        label: 'Pending Approval',
        className: 'bg-orange-500 hover:bg-orange-600',
      }
    }
    if (status === SurplusStatus.APPROVED) {
      return {
        variant: 'default' as const,
        label: 'Approved',
        className: 'bg-green-500 hover:bg-green-600',
      }
    }
    if (status === SurplusStatus.DISPOSED) {
      return { variant: 'secondary' as const, label: 'Disposed' }
    }
    // Legacy statuses
    if (status === SurplusStatus.Requested) {
      return {
        variant: 'default' as const,
        label: 'Requested',
        className: 'bg-blue-500 hover:bg-blue-600',
      }
    }
    if (status === SurplusStatus.Approved) {
      return {
        variant: 'default' as const,
        label: 'Approved',
        className: 'bg-green-500 hover:bg-green-600',
      }
    }
    if (status === SurplusStatus.Auction) {
      return {
        variant: 'default' as const,
        label: 'Auction',
        className: 'bg-purple-500 hover:bg-purple-600',
      }
    }
    if (status === SurplusStatus.Recycled) {
      return { variant: 'secondary' as const, label: 'Recycled' }
    }
    if (status === SurplusStatus.Closed) {
      return { variant: 'outline' as const, label: 'Closed' }
    }

    return { variant: 'outline' as const, label: status }
  }

  const { variant, label, className } = getVariantAndLabel()

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
