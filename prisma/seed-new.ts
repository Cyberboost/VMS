import {
  PrismaClient,
  UserRole,
  VehicleStatus,
  DriverStatus,
  IncidentSeverity,
  IncidentStatus,
  SurplusCondition,
  SurplusStatus,
  FaultDetermination,
  AssignmentType,
  ComplianceEntityType,
  ComplianceRuleType,
  ComplianceEventStatus,
  WorkOrderStatus,
  AuditAction,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed...')

  // Clear existing data (in reverse dependency order)
  console.log('🧹 Cleaning existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.notificationQueue.deleteMany()
  await prisma.savedView.deleteMany()
  await prisma.ingestionRow.deleteMany()
  await prisma.ingestion.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.surplusApproval.deleteMany()
  await prisma.surplusCase.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.maintenancePlan.deleteMany()
  await prisma.complianceEvent.deleteMany()
  await prisma.complianceRule.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.surplusRequest.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()
  await prisma.organization.deleteMany()

  console.log('✓ Cleaned existing data')

  // ============================================================================
  // CREATE ORGANIZATION
  // ============================================================================

  const organization = await prisma.organization.create({
    data: {
      name: 'City of Atlanta — Department of Public Works',
      slug: 'city-of-atlanta-dpw',
      settings: {
        timezone: 'America/New_York',
        fiscalYearStart: '07-01',
      },
    },
  })

  console.log('✓ Created organization:', organization.name)

  // ============================================================================
  // CREATE DEPARTMENTS
  // ============================================================================

  const fleetOps = await prisma.department.create({
    data: {
      orgId: organization.id,
      name: 'Fleet Operations',
      code: 'FLEET',
    },
  })

  const parksRec = await prisma.department.create({
    data: {
      orgId: organization.id,
      name: 'Parks & Recreation',
      code: 'PARKS',
    },
  })

  const waterMgmt = await prisma.department.create({
    data: {
      orgId: organization.id,
      name: 'Water Management',
      code: 'WATER',
    },
  })

  const publicSafety = await prisma.department.create({
    data: {
      orgId: organization.id,
      name: 'Public Safety',
      code: 'SAFETY',
    },
  })

  const administration = await prisma.department.create({
    data: {
      orgId: organization.id,
      name: 'Administration',
      code: 'ADMIN',
    },
  })

  const departments = [fleetOps, parksRec, waterMgmt, publicSafety, administration]
  console.log('✓ Created 5 departments')

  // ============================================================================
  // CREATE USERS
  // ============================================================================

  const password = await bcrypt.hash('password123', 10)

  const superAdmin = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Sarah Johnson',
      email: 'admin@fleet.gov',
      passwordHash: password,
      role: UserRole.SUPER_ADMIN,
      employeeId: 'EMP-001',
      phone: '404-555-0001',
      isActive: true,
    },
  })

  const orgAdmin = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Michael Chen',
      email: 'orgadmin@fleet.gov',
      passwordHash: password,
      role: UserRole.ORG_ADMIN,
      departmentId: fleetOps.id,
      employeeId: 'EMP-002',
      phone: '404-555-0002',
      isActive: true,
    },
  })

  const fleetManager1 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'James Wilson',
      email: 'fleetmanager@fleet.gov',
      passwordHash: password,
      role: UserRole.FLEET_MANAGER,
      departmentId: fleetOps.id,
      employeeId: 'EMP-003',
      phone: '404-555-0003',
      isActive: true,
    },
  })

  const fleetManager2 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Lisa Rodriguez',
      email: 'fleetmanager2@fleet.gov',
      passwordHash: password,
      role: UserRole.FLEET_MANAGER,
      departmentId: fleetOps.id,
      employeeId: 'EMP-004',
      phone: '404-555-0004',
      isActive: true,
    },
  })

  const deptManager1 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Robert Taylor',
      email: 'deptmgr1@fleet.gov',
      passwordHash: password,
      role: UserRole.DEPT_MANAGER,
      departmentId: parksRec.id,
      employeeId: 'EMP-005',
      phone: '404-555-0005',
      isActive: true,
    },
  })

  const deptManager2 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Jennifer Martinez',
      email: 'deptmgr2@fleet.gov',
      passwordHash: password,
      role: UserRole.DEPT_MANAGER,
      departmentId: waterMgmt.id,
      employeeId: 'EMP-006',
      phone: '404-555-0006',
      isActive: true,
    },
  })

  const deptManager3 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'David Anderson',
      email: 'deptmgr3@fleet.gov',
      passwordHash: password,
      role: UserRole.DEPT_MANAGER,
      departmentId: publicSafety.id,
      employeeId: 'EMP-007',
      phone: '404-555-0007',
      isActive: true,
    },
  })

  const complianceOfficer1 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Emily Davis',
      email: 'compliance1@fleet.gov',
      passwordHash: password,
      role: UserRole.COMPLIANCE_OFFICER,
      departmentId: fleetOps.id,
      employeeId: 'EMP-008',
      phone: '404-555-0008',
      isActive: true,
    },
  })

  const complianceOfficer2 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'William Brown',
      email: 'compliance2@fleet.gov',
      passwordHash: password,
      role: UserRole.COMPLIANCE_OFFICER,
      departmentId: fleetOps.id,
      employeeId: 'EMP-009',
      phone: '404-555-0009',
      isActive: true,
    },
  })

  const readOnly1 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Patricia Miller',
      email: 'readonly1@fleet.gov',
      passwordHash: password,
      role: UserRole.READ_ONLY,
      departmentId: administration.id,
      employeeId: 'EMP-010',
      phone: '404-555-0010',
      isActive: true,
    },
  })

  const readOnly2 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Christopher Garcia',
      email: 'readonly2@fleet.gov',
      passwordHash: password,
      role: UserRole.READ_ONLY,
      departmentId: administration.id,
      employeeId: 'EMP-011',
      phone: '404-555-0011',
      isActive: true,
    },
  })

  const readOnly3 = await prisma.user.create({
    data: {
      orgId: organization.id,
      name: 'Nancy Wilson',
      email: 'readonly3@fleet.gov',
      passwordHash: password,
      role: UserRole.READ_ONLY,
      employeeId: 'EMP-012',
      phone: '404-555-0012',
      isActive: true,
    },
  })

  // Create some driver users
  const driverUsers = await Promise.all([
    prisma.user.create({
      data: {
        orgId: organization.id,
        name: 'John Driver',
        email: 'driver1@fleet.gov',
        passwordHash: password,
        role: UserRole.DRIVER,
        employeeId: 'DRV-USER-001',
        phone: '404-555-1001',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        orgId: organization.id,
        name: 'Mary Driver',
        email: 'driver2@fleet.gov',
        passwordHash: password,
        role: UserRole.DRIVER,
        employeeId: 'DRV-USER-002',
        phone: '404-555-1002',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        orgId: organization.id,
        name: 'Charles Driver',
        email: 'driver3@fleet.gov',
        passwordHash: password,
        role: UserRole.DRIVER,
        employeeId: 'DRV-USER-003',
        phone: '404-555-1003',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        orgId: organization.id,
        name: 'Barbara Driver',
        email: 'driver4@fleet.gov',
        passwordHash: password,
        role: UserRole.DRIVER,
        employeeId: 'DRV-USER-004',
        phone: '404-555-1004',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        orgId: organization.id,
        name: 'Thomas Driver',
        email: 'driver5@fleet.gov',
        passwordHash: password,
        role: UserRole.DRIVER,
        employeeId: 'DRV-USER-005',
        phone: '404-555-1005',
        isActive: true,
      },
    }),
  ])

  console.log('✓ Created users with various roles (18 total)')

  // Continue in next part...
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
