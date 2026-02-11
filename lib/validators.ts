import { z } from 'zod'
import {
  VehicleStatus,
  DriverStatus,
  IncidentSeverity,
  IncidentStatus,
  SurplusCondition,
  SurplusStatus,
  UserRole,
  FaultDetermination,
  AssignmentType,
  ComplianceEntityType,
  ComplianceRuleType,
  WorkOrderStatus,
} from '@prisma/client'

// ============================================================================
// VEHICLE SCHEMAS
// ============================================================================

export const vehicleSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17),
  plateNumber: z.string().optional(),
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
  insuranceExpiration: z.date().optional(),
  registrationExpiration: z.date().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  replacementCostEstimate: z.number().min(0).optional(),
})

// ============================================================================
// DRIVER SCHEMAS
// ============================================================================

export const driverSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  cdlNumber: z.string().optional(),
  cdlExpiration: z.date().optional(),
  medicalCertExpiration: z.date().optional(),
  status: z.nativeEnum(DriverStatus),
  licenseType: z.string().optional(),
  cdlFlag: z.boolean().optional(),
  trainingStatus: z.string().optional(),
  photoUrl: z.string().url().optional(),
  employeeId: z.string().optional(),
})

// ============================================================================
// INCIDENT SCHEMAS
// ============================================================================

export const incidentSchema = z.object({
  incidentDate: z.date(),
  description: z.string().min(1, 'Description is required'),
  severity: z.nativeEnum(IncidentSeverity),
  atFault: z.boolean(),
  department: z.string().min(1, 'Department is required'),
  status: z.nativeEnum(IncidentStatus),
  location: z.string().optional(),
  faultDetermination: z.nativeEnum(FaultDetermination).optional(),
  costEstimate: z.number().min(0).optional(),
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  driverId: z.string().uuid('Invalid driver ID').optional(),
})

// ============================================================================
// DEPARTMENT SCHEMAS
// ============================================================================

export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().optional(),
  parentDeptId: z.string().uuid().optional(),
})

// ============================================================================
// COMPLIANCE SCHEMAS
// ============================================================================

export const complianceRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  entityType: z.nativeEnum(ComplianceEntityType),
  fieldToCheck: z.string().min(1, 'Field to check is required'),
  ruleType: z.nativeEnum(ComplianceRuleType),
  warningDaysBefore: z.number().int().min(0).optional(),
  criticalDaysBefore: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

// ============================================================================
// SURPLUS SCHEMAS
// ============================================================================

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

export const surplusCaseSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  reason: z.string().min(1, 'Reason is required'),
  conditionRating: z.nativeEnum(SurplusCondition),
  estimatedValue: z.number().min(0).optional(),
  costToRepair: z.number().min(0).optional(),
  recommendedDisposition: z.string().optional(),
  photos: z.array(z.string()).optional(),
})

// ============================================================================
// MAINTENANCE SCHEMAS
// ============================================================================

export const maintenancePlanSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  planType: z.string().min(1, 'Plan type is required'),
  intervalMiles: z.number().int().min(0).optional(),
  intervalDays: z.number().int().min(0).optional(),
  lastServiceDate: z.date().optional(),
  lastServiceMiles: z.number().int().min(0).optional(),
  nextDueDate: z.date().optional(),
  nextDueMiles: z.number().int().min(0).optional(),
})

export const workOrderSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  maintenancePlanId: z.string().uuid().optional(),
  description: z.string().min(1, 'Description is required'),
  status: z.nativeEnum(WorkOrderStatus),
  cost: z.number().min(0).optional(),
  completedAt: z.date().optional(),
})

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.nativeEnum(UserRole),
  departmentId: z.string().uuid().optional(),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  photoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

export const dashboardFilterSchema = z.object({
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  department: z.string().optional(),
})

export const vehicleFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  yearFrom: z.number().int().optional(),
  yearTo: z.number().int().optional(),
})

export const driverFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.nativeEnum(DriverStatus).optional(),
})

export const incidentFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})
