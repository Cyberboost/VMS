import { z } from 'zod'
import {
  VehicleStatus,
  DriverStatus,
  IncidentSeverity,
  IncidentStatus,
  SurplusCondition,
  SurplusStatus,
  UserRole,
} from '@prisma/client'

export const vehicleSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  department: z.string().min(1, 'Department is required'),
  division: z.string().optional(),
  status: z.nativeEnum(VehicleStatus),
  odometer: z.number().int().min(0).optional(),
  fuelType: z.string().optional(),
  inServiceDate: z.date().optional(),
  replacementTargetYear: z.number().int().min(2000).max(2100).optional(),
  lastDOTDate: z.date().optional(),
  notes: z.string().optional(),
})

export const driverSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  cdlNumber: z.string().optional(),
  cdlExpiration: z.date().optional(),
  status: z.nativeEnum(DriverStatus),
})

export const incidentSchema = z.object({
  incidentDate: z.date(),
  description: z.string().min(1, 'Description is required'),
  severity: z.nativeEnum(IncidentSeverity),
  atFault: z.boolean(),
  department: z.string().min(1, 'Department is required'),
  status: z.nativeEnum(IncidentStatus),
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  driverId: z.string().uuid('Invalid driver ID').optional(),
})

export const surplusRequestSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  requestedBy: z.string().uuid('Invalid user ID'),
  condition: z.nativeEnum(SurplusCondition),
  reason: z.string().min(1, 'Reason is required'),
  status: z.nativeEnum(SurplusStatus),
  notes: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
})

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.nativeEnum(UserRole),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
