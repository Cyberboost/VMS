import { Badge } from '@/components/ui/badge'
import { WorkOrderStatus } from '@prisma/client'

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus
}

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const config = {
    [WorkOrderStatus.PENDING]: {
      label: 'Pending',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent',
    },
    [WorkOrderStatus.IN_PROGRESS]: {
      label: 'In Progress',
      className: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
    },
    [WorkOrderStatus.COMPLETED]: {
      label: 'Completed',
      className: 'bg-green-500 hover:bg-green-600 text-white border-transparent',
    },
    [WorkOrderStatus.CANCELLED]: {
      label: 'Cancelled',
      className: 'bg-gray-500 hover:bg-gray-600 text-white border-transparent',
    },
  }

  const { label, className } = config[status]

  return <Badge className={className}>{label}</Badge>
}
