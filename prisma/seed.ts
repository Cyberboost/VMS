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
  SurplusApprovalDecision,
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

  // ============================================================================
  // CREATE VEHICLES
  // ============================================================================

  const now = new Date()
  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const vehicles = await Promise.all([
    // Fleet Operations vehicles
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-001',
        vin: '1HGBH41JXMN109186',
        plateNumber: 'ATL-FL-001',
        year: 2022,
        make: 'Ford',
        model: 'F-150',
        department: 'Fleet Operations',
        division: 'Maintenance',
        status: VehicleStatus.InService,
        odometer: 15234,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2022-03-15'),
        replacementTargetYear: 2029,
        lastDOTDate: daysAgo(45),
        insuranceExpiration: daysFromNow(180),
        registrationExpiration: daysFromNow(90),
        replacementCostEstimate: 45000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-002',
        vin: '2HGBH41JXMN109187',
        plateNumber: 'ATL-FL-002',
        year: 2021,
        make: 'Chevrolet',
        model: 'Silverado 2500',
        department: 'Fleet Operations',
        status: VehicleStatus.InService,
        odometer: 28450,
        fuelType: 'Diesel',
        inServiceDate: new Date('2021-06-01'),
        replacementTargetYear: 2028,
        lastDOTDate: daysAgo(320),
        insuranceExpiration: daysFromNow(15),
        registrationExpiration: daysFromNow(45),
        replacementCostEstimate: 52000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-003',
        vin: '3HGBH41JXMN109188',
        plateNumber: 'ATL-FL-003',
        year: 2023,
        make: 'Ford',
        model: 'Transit Van',
        department: 'Fleet Operations',
        status: VehicleStatus.InRepair,
        odometer: 8920,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2023-01-10'),
        replacementTargetYear: 2030,
        lastDOTDate: daysAgo(90),
        insuranceExpiration: daysFromNow(270),
        registrationExpiration: daysFromNow(270),
        replacementCostEstimate: 48000.00,
      },
    }),
    // Parks & Recreation vehicles
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-004',
        vin: '4HGBH41JXMN109189',
        plateNumber: 'ATL-PR-001',
        year: 2020,
        make: 'John Deere',
        model: 'Gator Utility Vehicle',
        department: 'Parks & Recreation',
        division: 'Grounds Maintenance',
        status: VehicleStatus.InService,
        odometer: 3420,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2020-04-20'),
        replacementTargetYear: 2027,
        insuranceExpiration: daysFromNow(120),
        registrationExpiration: daysFromNow(120),
        replacementCostEstimate: 18000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-005',
        vin: '5HGBH41JXMN109190',
        plateNumber: 'ATL-PR-002',
        year: 2019,
        make: 'Ford',
        model: 'F-250',
        department: 'Parks & Recreation',
        status: VehicleStatus.InService,
        odometer: 42150,
        fuelType: 'Diesel',
        inServiceDate: new Date('2019-07-15'),
        replacementTargetYear: 2026,
        lastDOTDate: daysAgo(25),
        insuranceExpiration: daysFromNow(210),
        registrationExpiration: daysFromNow(150),
        replacementCostEstimate: 48000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-006',
        vin: '6HGBH41JXMN109191',
        plateNumber: 'ATL-PR-003',
        year: 2022,
        make: 'Chevrolet',
        model: 'Colorado',
        department: 'Parks & Recreation',
        status: VehicleStatus.InService,
        odometer: 18340,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2022-05-10'),
        replacementTargetYear: 2029,
        insuranceExpiration: daysFromNow(300),
        registrationExpiration: daysFromNow(300),
        replacementCostEstimate: 38000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-007',
        vin: '7HGBH41JXMN109192',
        plateNumber: 'ATL-PR-004',
        year: 2015,
        make: 'Ford',
        model: 'F-150',
        department: 'Parks & Recreation',
        status: VehicleStatus.PENDING_SURPLUS,
        odometer: 89450,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2015-08-01'),
        replacementTargetYear: 2022,
        lastDOTDate: daysAgo(400),
        insuranceExpiration: daysFromNow(60),
        registrationExpiration: daysFromNow(30),
        replacementCostEstimate: 42000.00,
      },
    }),
    // Water Management vehicles
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-008',
        vin: '8HGBH41JXMN109193',
        plateNumber: 'ATL-WM-001',
        year: 2021,
        make: 'Chevrolet',
        model: 'Silverado 3500',
        department: 'Water Management',
        division: 'Distribution',
        status: VehicleStatus.InService,
        odometer: 31200,
        fuelType: 'Diesel',
        inServiceDate: new Date('2021-02-15'),
        replacementTargetYear: 2028,
        lastDOTDate: daysAgo(10),
        insuranceExpiration: daysFromNow(180),
        registrationExpiration: daysFromNow(180),
        replacementCostEstimate: 55000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-009',
        vin: '9HGBH41JXMN109194',
        plateNumber: 'ATL-WM-002',
        year: 2020,
        make: 'International',
        model: 'MV Series',
        department: 'Water Management',
        status: VehicleStatus.InService,
        odometer: 25680,
        fuelType: 'Diesel',
        inServiceDate: new Date('2020-09-01'),
        replacementTargetYear: 2027,
        lastDOTDate: daysAgo(5),
        insuranceExpiration: daysFromNow(240),
        registrationExpiration: daysFromNow(200),
        replacementCostEstimate: 85000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-010',
        vin: 'AHGBH41JXMN109195',
        plateNumber: 'ATL-WM-003',
        year: 2018,
        make: 'Ford',
        model: 'F-350',
        department: 'Water Management',
        status: VehicleStatus.InService,
        odometer: 52300,
        fuelType: 'Diesel',
        inServiceDate: new Date('2018-11-10'),
        replacementTargetYear: 2025,
        lastDOTDate: daysAgo(180),
        insuranceExpiration: daysFromNow(90),
        registrationExpiration: daysFromNow(60),
        replacementCostEstimate: 52000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-011',
        vin: 'BHGBH41JXMN109196',
        plateNumber: 'ATL-WM-004',
        year: 2016,
        make: 'Chevrolet',
        model: 'Silverado 2500',
        department: 'Water Management',
        status: VehicleStatus.OutOfService,
        odometer: 78900,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2016-03-20'),
        replacementTargetYear: 2023,
        lastDOTDate: daysAgo(450),
        insuranceExpiration: daysAgo(10),
        registrationExpiration: daysAgo(5),
        replacementCostEstimate: 48000.00,
      },
    }),
    // Public Safety vehicles
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-012',
        vin: 'CHGBH41JXMN109197',
        plateNumber: 'ATL-PS-001',
        year: 2023,
        make: 'Ford',
        model: 'Explorer',
        department: 'Public Safety',
        division: 'Emergency Response',
        status: VehicleStatus.InService,
        odometer: 12450,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2023-02-01'),
        replacementTargetYear: 2030,
        lastDOTDate: daysAgo(60),
        insuranceExpiration: daysFromNow(330),
        registrationExpiration: daysFromNow(330),
        replacementCostEstimate: 42000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-013',
        vin: 'DHGBH41JXMN109198',
        plateNumber: 'ATL-PS-002',
        year: 2022,
        make: 'Chevrolet',
        model: 'Tahoe',
        department: 'Public Safety',
        status: VehicleStatus.InService,
        odometer: 22180,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2022-04-15'),
        replacementTargetYear: 2029,
        lastDOTDate: daysAgo(100),
        insuranceExpiration: daysFromNow(250),
        registrationExpiration: daysFromNow(220),
        replacementCostEstimate: 48000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-014',
        vin: 'EHGBH41JXMN109199',
        plateNumber: 'ATL-PS-003',
        year: 2021,
        make: 'Ford',
        model: 'F-250',
        department: 'Public Safety',
        status: VehicleStatus.InService,
        odometer: 35200,
        fuelType: 'Diesel',
        inServiceDate: new Date('2021-08-20'),
        replacementTargetYear: 2028,
        lastDOTDate: daysAgo(15),
        insuranceExpiration: daysFromNow(190),
        registrationExpiration: daysFromNow(160),
        replacementCostEstimate: 50000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-015',
        vin: 'FHGBH41JXMN109200',
        plateNumber: 'ATL-PS-004',
        year: 2017,
        make: 'Chevrolet',
        model: 'Silverado 1500',
        department: 'Public Safety',
        status: VehicleStatus.InRepair,
        odometer: 68450,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2017-05-10'),
        replacementTargetYear: 2024,
        lastDOTDate: daysAgo(200),
        insuranceExpiration: daysFromNow(100),
        registrationExpiration: daysFromNow(70),
        replacementCostEstimate: 45000.00,
      },
    }),
    // Administration vehicles
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-016',
        vin: 'GHGBH41JXMN109201',
        plateNumber: 'ATL-AD-001',
        year: 2022,
        make: 'Toyota',
        model: 'Camry',
        department: 'Administration',
        status: VehicleStatus.InService,
        odometer: 14250,
        fuelType: 'Hybrid',
        inServiceDate: new Date('2022-06-01'),
        replacementTargetYear: 2029,
        insuranceExpiration: daysFromNow(280),
        registrationExpiration: daysFromNow(280),
        replacementCostEstimate: 32000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-017',
        vin: 'HHGBH41JXMN109202',
        plateNumber: 'ATL-AD-002',
        year: 2021,
        make: 'Honda',
        model: 'Accord',
        department: 'Administration',
        status: VehicleStatus.InService,
        odometer: 28900,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2021-09-15'),
        replacementTargetYear: 2028,
        insuranceExpiration: daysFromNow(200),
        registrationExpiration: daysFromNow(170),
        replacementCostEstimate: 30000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-018',
        vin: 'IHGBH41JXMN109203',
        plateNumber: 'ATL-AD-003',
        year: 2015,
        make: 'Ford',
        model: 'Fusion',
        department: 'Administration',
        status: VehicleStatus.Surplus,
        odometer: 92340,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2015-10-01'),
        replacementTargetYear: 2022,
        insuranceExpiration: daysAgo(30),
        registrationExpiration: daysAgo(20),
        replacementCostEstimate: 28000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-019',
        vin: 'JHGBH41JXMN109204',
        plateNumber: 'ATL-FL-004',
        year: 2020,
        make: 'Ford',
        model: 'Ranger',
        department: 'Fleet Operations',
        status: VehicleStatus.InService,
        odometer: 38200,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2020-11-10'),
        replacementTargetYear: 2027,
        lastDOTDate: daysAgo(150),
        insuranceExpiration: daysFromNow(140),
        registrationExpiration: daysFromNow(110),
        replacementCostEstimate: 35000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-020',
        vin: 'KHGBH41JXMN109205',
        plateNumber: 'ATL-WM-005',
        year: 2019,
        make: 'Ram',
        model: '2500',
        department: 'Water Management',
        status: VehicleStatus.InService,
        odometer: 45780,
        fuelType: 'Diesel',
        inServiceDate: new Date('2019-12-15'),
        replacementTargetYear: 2026,
        lastDOTDate: daysAgo(280),
        insuranceExpiration: daysFromNow(3),
        registrationExpiration: daysFromNow(25),
        replacementCostEstimate: 50000.00,
      },
    }),
    prisma.vehicle.create({
      data: {
        orgId: organization.id,
        vehicleId: 'VEH-021',
        vin: 'LHGBH41JXMN109206',
        plateNumber: 'ATL-PR-005',
        year: 2018,
        make: 'Kubota',
        model: 'RTV-X1140',
        department: 'Parks & Recreation',
        status: VehicleStatus.InService,
        odometer: 5240,
        fuelType: 'Diesel',
        inServiceDate: new Date('2018-06-01'),
        replacementTargetYear: 2025,
        insuranceExpiration: daysFromNow(165),
        registrationExpiration: daysFromNow(135),
        replacementCostEstimate: 20000.00,
      },
    }),
  ])

  console.log('✓ Created 21 vehicles')

  // ============================================================================
  // CREATE DRIVERS
  // ============================================================================

  const drivers = await Promise.all([
    // Fleet Operations drivers
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-001',
        firstName: 'Marcus',
        lastName: 'Washington',
        email: 'marcus.washington@atlanta.gov',
        phone: '404-555-2001',
        department: 'Fleet Operations',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(180),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-002',
        firstName: 'Angela',
        lastName: 'Thompson',
        email: 'angela.thompson@atlanta.gov',
        phone: '404-555-2002',
        department: 'Fleet Operations',
        licenseType: 'CDL Class B',
        cdlFlag: true,
        cdlNumber: 'CDL-B-001234',
        cdlExpiration: daysFromNow(45),
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(90),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-003',
        firstName: 'Kevin',
        lastName: 'Harris',
        email: 'kevin.harris@atlanta.gov',
        phone: '404-555-2003',
        department: 'Fleet Operations',
        licenseType: 'CDL Class A',
        cdlFlag: true,
        cdlNumber: 'CDL-A-005678',
        cdlExpiration: daysFromNow(25),
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(20),
      },
    }),
    // Parks & Recreation drivers
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-004',
        firstName: 'Tamara',
        lastName: 'Jackson',
        email: 'tamara.jackson@atlanta.gov',
        phone: '404-555-2004',
        department: 'Parks & Recreation',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(220),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-005',
        firstName: 'Raymond',
        lastName: 'Lewis',
        email: 'raymond.lewis@atlanta.gov',
        phone: '404-555-2005',
        department: 'Parks & Recreation',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(300),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-006',
        firstName: 'Cynthia',
        lastName: 'Moore',
        email: 'cynthia.moore@atlanta.gov',
        phone: '404-555-2006',
        department: 'Parks & Recreation',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Inactive,
        medicalCertExpiration: daysAgo(10),
      },
    }),
    // Water Management drivers
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-007',
        firstName: 'Gregory',
        lastName: 'White',
        email: 'gregory.white@atlanta.gov',
        phone: '404-555-2007',
        department: 'Water Management',
        licenseType: 'CDL Class B',
        cdlFlag: true,
        cdlNumber: 'CDL-B-009876',
        cdlExpiration: daysFromNow(120),
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(150),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-008',
        firstName: 'Patricia',
        lastName: 'Robinson',
        email: 'patricia.robinson@atlanta.gov',
        phone: '404-555-2008',
        department: 'Water Management',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(240),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-009',
        firstName: 'Donald',
        lastName: 'Clark',
        email: 'donald.clark@atlanta.gov',
        phone: '404-555-2009',
        department: 'Water Management',
        licenseType: 'CDL Class A',
        cdlFlag: true,
        cdlNumber: 'CDL-A-011223',
        cdlExpiration: daysFromNow(200),
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(190),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-010',
        firstName: 'Sandra',
        lastName: 'Martinez',
        email: 'sandra.martinez@atlanta.gov',
        phone: '404-555-2010',
        department: 'Water Management',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Suspended,
        medicalCertExpiration: daysFromNow(90),
      },
    }),
    // Public Safety drivers
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-011',
        firstName: 'Kenneth',
        lastName: 'Young',
        email: 'kenneth.young@atlanta.gov',
        phone: '404-555-2011',
        department: 'Public Safety',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(270),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-012',
        firstName: 'Deborah',
        lastName: 'Allen',
        email: 'deborah.allen@atlanta.gov',
        phone: '404-555-2012',
        department: 'Public Safety',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(15),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-013',
        firstName: 'Steven',
        lastName: 'King',
        email: 'steven.king@atlanta.gov',
        phone: '404-555-2013',
        department: 'Public Safety',
        licenseType: 'CDL Class B',
        cdlFlag: true,
        cdlNumber: 'CDL-B-013344',
        cdlExpiration: daysFromNow(50),
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(55),
      },
    }),
    // Administration drivers
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-014',
        firstName: 'Carol',
        lastName: 'Scott',
        email: 'carol.scott@atlanta.gov',
        phone: '404-555-2014',
        department: 'Administration',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(320),
      },
    }),
    prisma.driver.create({
      data: {
        orgId: organization.id,
        driverId: 'DRV-015',
        firstName: 'Paul',
        lastName: 'Green',
        email: 'paul.green@atlanta.gov',
        phone: '404-555-2015',
        department: 'Administration',
        licenseType: 'Class C',
        cdlFlag: false,
        status: DriverStatus.Active,
        medicalCertExpiration: daysFromNow(400),
      },
    }),
  ])

  console.log('✓ Created 15 drivers')

  // ============================================================================
  // CREATE COMPLIANCE RULES
  // ============================================================================

  const complianceRules = await Promise.all([
    // Driver license expiration
    prisma.complianceRule.create({
      data: {
        orgId: organization.id,
        name: 'Driver License Expiration',
        entityType: ComplianceEntityType.DRIVER,
        fieldToCheck: 'cdlExpiration',
        ruleType: ComplianceRuleType.EXPIRATION,
        warningDaysBefore: 60,
        criticalDaysBefore: 30,
        isActive: true,
        createdBy: complianceOfficer1.id,
      },
    }),
    // CDL expiration (for CDL holders)
    prisma.complianceRule.create({
      data: {
        orgId: organization.id,
        name: 'CDL Expiration',
        entityType: ComplianceEntityType.DRIVER,
        fieldToCheck: 'cdlExpiration',
        ruleType: ComplianceRuleType.EXPIRATION,
        warningDaysBefore: 60,
        criticalDaysBefore: 30,
        isActive: true,
        createdBy: complianceOfficer1.id,
      },
    }),
    // Medical certificate expiration
    prisma.complianceRule.create({
      data: {
        orgId: organization.id,
        name: 'Medical Certificate Expiration',
        entityType: ComplianceEntityType.DRIVER,
        fieldToCheck: 'medicalCertExpiration',
        ruleType: ComplianceRuleType.EXPIRATION,
        warningDaysBefore: 30,
        criticalDaysBefore: 14,
        isActive: true,
        createdBy: complianceOfficer1.id,
      },
    }),
    // DOT inspection
    prisma.complianceRule.create({
      data: {
        orgId: organization.id,
        name: 'DOT Inspection Due',
        entityType: ComplianceEntityType.VEHICLE,
        fieldToCheck: 'lastDOTDate',
        ruleType: ComplianceRuleType.EXPIRATION,
        warningDaysBefore: 30,
        criticalDaysBefore: 7,
        isActive: true,
        createdBy: complianceOfficer2.id,
      },
    }),
    // Vehicle insurance expiration
    prisma.complianceRule.create({
      data: {
        orgId: organization.id,
        name: 'Vehicle Insurance Expiration',
        entityType: ComplianceEntityType.VEHICLE,
        fieldToCheck: 'insuranceExpiration',
        ruleType: ComplianceRuleType.EXPIRATION,
        warningDaysBefore: 30,
        criticalDaysBefore: 7,
        isActive: true,
        createdBy: complianceOfficer2.id,
      },
    }),
    // Vehicle registration expiration
    prisma.complianceRule.create({
      data: {
        orgId: organization.id,
        name: 'Vehicle Registration Expiration',
        entityType: ComplianceEntityType.VEHICLE,
        fieldToCheck: 'registrationExpiration',
        ruleType: ComplianceRuleType.EXPIRATION,
        warningDaysBefore: 30,
        criticalDaysBefore: 7,
        isActive: true,
        createdBy: complianceOfficer2.id,
      },
    }),
  ])

  console.log('✓ Created 6 compliance rules')

  // ============================================================================
  // CREATE COMPLIANCE EVENTS
  // ============================================================================

  const complianceEvents = await Promise.all([
    // Critical - Medical cert expiring soon (DRV-012)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[2].id, // Medical cert rule
        entityType: ComplianceEntityType.DRIVER,
        entityId: drivers[11].id, // DRV-012
        status: ComplianceEventStatus.CRITICAL,
        dueDate: daysFromNow(15),
      },
    }),
    // Critical - CDL expiring soon (DRV-003)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[1].id, // CDL rule
        entityType: ComplianceEntityType.DRIVER,
        entityId: drivers[2].id, // DRV-003
        status: ComplianceEventStatus.CRITICAL,
        dueDate: daysFromNow(25),
      },
    }),
    // Warning - CDL expiring (DRV-002)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[1].id,
        entityType: ComplianceEntityType.DRIVER,
        entityId: drivers[1].id, // DRV-002
        status: ComplianceEventStatus.WARNING,
        dueDate: daysFromNow(45),
      },
    }),
    // Warning - CDL expiring (DRV-013)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[1].id,
        entityType: ComplianceEntityType.DRIVER,
        entityId: drivers[12].id, // DRV-013
        status: ComplianceEventStatus.WARNING,
        dueDate: daysFromNow(50),
      },
    }),
    // Overdue - Medical cert expired (DRV-006)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[2].id,
        entityType: ComplianceEntityType.DRIVER,
        entityId: drivers[5].id, // DRV-006
        status: ComplianceEventStatus.OVERDUE,
        dueDate: daysAgo(10),
      },
    }),
    // Critical - Insurance expiring soon (VEH-020)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[4].id, // Insurance rule
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[19].id, // VEH-020
        status: ComplianceEventStatus.CRITICAL,
        dueDate: daysFromNow(3),
      },
    }),
    // Critical - Insurance expiring soon (VEH-002)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[4].id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[1].id, // VEH-002
        status: ComplianceEventStatus.CRITICAL,
        dueDate: daysFromNow(15),
      },
    }),
    // Warning - Registration expiring (VEH-007)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[5].id, // Registration rule
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[6].id, // VEH-007
        status: ComplianceEventStatus.WARNING,
        dueDate: daysFromNow(30),
      },
    }),
    // Warning - Registration expiring (VEH-020)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[5].id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[19].id, // VEH-020
        status: ComplianceEventStatus.WARNING,
        dueDate: daysFromNow(25),
      },
    }),
    // Overdue - Insurance expired (VEH-011)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[4].id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[10].id, // VEH-011
        status: ComplianceEventStatus.OVERDUE,
        dueDate: daysAgo(10),
      },
    }),
    // Overdue - Registration expired (VEH-011)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[5].id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[10].id, // VEH-011
        status: ComplianceEventStatus.OVERDUE,
        dueDate: daysAgo(5),
      },
    }),
    // Warning - DOT inspection due (VEH-002)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[3].id, // DOT rule
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[1].id, // VEH-002
        status: ComplianceEventStatus.WARNING,
        dueDate: daysFromNow(45),
      },
    }),
    // OK - Recent DOT inspection (VEH-008)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[3].id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[7].id, // VEH-008
        status: ComplianceEventStatus.OK,
        dueDate: daysFromNow(355),
      },
    }),
    // OK - Recent DOT inspection (VEH-009)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[3].id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[8].id, // VEH-009
        status: ComplianceEventStatus.OK,
        dueDate: daysFromNow(360),
      },
    }),
    // OK - Insurance good (VEH-016)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[4].id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicles[15].id, // VEH-016
        status: ComplianceEventStatus.OK,
        dueDate: daysFromNow(280),
      },
    }),
    // OK - Medical cert good (DRV-001)
    prisma.complianceEvent.create({
      data: {
        orgId: organization.id,
        ruleId: complianceRules[2].id,
        entityType: ComplianceEntityType.DRIVER,
        entityId: drivers[0].id, // DRV-001
        status: ComplianceEventStatus.OK,
        dueDate: daysFromNow(180),
      },
    }),
  ])

  console.log('✓ Created 16 compliance events')

  // ============================================================================
  // CREATE INCIDENTS
  // ============================================================================

  const incidents = await Promise.all([
    // Recent incidents
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(5),
        description: 'Minor fender bender in parking lot. No injuries.',
        severity: IncidentSeverity.Low,
        atFault: true,
        department: 'Fleet Operations',
        status: IncidentStatus.UNDER_REVIEW,
        location: '55 Trinity Ave SW, Atlanta, GA',
        faultDetermination: FaultDetermination.AT_FAULT,
        costEstimate: 1250.00,
        vehicleId: vehicles[0].id, // VEH-001
        driverId: drivers[0].id, // DRV-001
        createdBy: fleetManager1.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(12),
        description: 'Collision with deer on rural road. Front end damage.',
        severity: IncidentSeverity.Medium,
        atFault: false,
        department: 'Parks & Recreation',
        status: IncidentStatus.CLOSED,
        location: 'Piedmont Park Access Road',
        faultDetermination: FaultDetermination.NOT_AT_FAULT,
        costEstimate: 4500.00,
        vehicleId: vehicles[4].id, // VEH-005
        driverId: drivers[3].id, // DRV-004
        createdBy: deptManager1.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(18),
        description: 'Backed into pole while reversing. Damage to rear bumper.',
        severity: IncidentSeverity.Low,
        atFault: true,
        department: 'Water Management',
        status: IncidentStatus.CLOSED,
        location: 'Water Treatment Facility - Zone 3',
        faultDetermination: FaultDetermination.AT_FAULT,
        costEstimate: 2100.00,
        vehicleId: vehicles[7].id, // VEH-008
        driverId: drivers[6].id, // DRV-007
        createdBy: deptManager2.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(25),
        description: 'Rear-ended at intersection. Other driver ran red light.',
        severity: IncidentSeverity.High,
        atFault: false,
        department: 'Public Safety',
        status: IncidentStatus.CLOSED,
        location: 'Intersection of Peachtree St & 10th St',
        faultDetermination: FaultDetermination.NOT_AT_FAULT,
        costEstimate: 8900.00,
        vehicleId: vehicles[11].id, // VEH-012
        driverId: drivers[10].id, // DRV-011
        createdBy: deptManager3.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(32),
        description: 'Side-swiped while changing lanes. Shared responsibility.',
        severity: IncidentSeverity.Medium,
        atFault: true,
        department: 'Fleet Operations',
        status: IncidentStatus.CLOSED,
        location: 'I-75/I-85 Connector',
        faultDetermination: FaultDetermination.SHARED,
        costEstimate: 3200.00,
        vehicleId: vehicles[2].id, // VEH-003
        driverId: drivers[1].id, // DRV-002
        createdBy: fleetManager1.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(48),
        description: 'Hit pothole causing tire damage and alignment issues.',
        severity: IncidentSeverity.Low,
        atFault: false,
        department: 'Water Management',
        status: IncidentStatus.CLOSED,
        location: 'Memorial Drive SE',
        faultDetermination: FaultDetermination.NOT_AT_FAULT,
        costEstimate: 850.00,
        vehicleId: vehicles[9].id, // VEH-010
        driverId: drivers[7].id, // DRV-008
        createdBy: deptManager2.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(55),
        description: 'Vehicle rolled back on hill into another vehicle.',
        severity: IncidentSeverity.Medium,
        atFault: true,
        department: 'Parks & Recreation',
        status: IncidentStatus.ACTION_REQUIRED,
        location: 'Grant Park Service Area',
        faultDetermination: FaultDetermination.AT_FAULT,
        costEstimate: 2800.00,
        vehicleId: vehicles[5].id, // VEH-006
        driverId: drivers[4].id, // DRV-005
        createdBy: deptManager1.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(62),
        description: 'Brake failure resulted in collision. Maintenance issue.',
        severity: IncidentSeverity.Critical,
        atFault: true,
        department: 'Public Safety',
        status: IncidentStatus.OPEN,
        location: 'Northside Drive NW',
        faultDetermination: FaultDetermination.PENDING,
        costEstimate: 15000.00,
        vehicleId: vehicles[14].id, // VEH-015
        driverId: drivers[12].id, // DRV-013
        createdBy: deptManager3.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(68),
        description: 'Minor scratch from tree branch overhang.',
        severity: IncidentSeverity.Low,
        atFault: false,
        department: 'Administration',
        status: IncidentStatus.CLOSED,
        location: 'City Hall Parking',
        faultDetermination: FaultDetermination.NOT_AT_FAULT,
        costEstimate: 650.00,
        vehicleId: vehicles[15].id, // VEH-016
        driverId: drivers[13].id, // DRV-014
        createdBy: orgAdmin.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(75),
        description: 'T-bone collision at intersection. Other driver fault.',
        severity: IncidentSeverity.High,
        atFault: false,
        department: 'Water Management',
        status: IncidentStatus.CLOSED,
        location: 'Boulevard & North Ave NE',
        faultDetermination: FaultDetermination.NOT_AT_FAULT,
        costEstimate: 12500.00,
        vehicleId: vehicles[8].id, // VEH-009
        driverId: drivers[8].id, // DRV-009
        createdBy: deptManager2.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(82),
        description: 'Door opened into adjacent vehicle in parking lot.',
        severity: IncidentSeverity.Low,
        atFault: true,
        department: 'Fleet Operations',
        status: IncidentStatus.CLOSED,
        location: 'Fleet Maintenance Facility',
        faultDetermination: FaultDetermination.AT_FAULT,
        costEstimate: 450.00,
        vehicleId: vehicles[18].id, // VEH-019
        driverId: drivers[0].id, // DRV-001
        createdBy: fleetManager2.id,
      },
    }),
    prisma.incident.create({
      data: {
        orgId: organization.id,
        incidentDate: daysAgo(89),
        description: 'Vandalism - windows broken, minor interior damage.',
        severity: IncidentSeverity.Medium,
        atFault: false,
        department: 'Parks & Recreation',
        status: IncidentStatus.CLOSED,
        location: 'Chastain Park',
        faultDetermination: FaultDetermination.NOT_AT_FAULT,
        costEstimate: 1850.00,
        vehicleId: vehicles[6].id, // VEH-007
        createdBy: deptManager1.id,
      },
    }),
  ])

  console.log('✓ Created 12 incidents')

  // ============================================================================
  // CREATE SURPLUS CASES
  // ============================================================================

  const surplusCases = await Promise.all([
    // Pending review
    prisma.surplusCase.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[6].id, // VEH-007 (2015 F-150)
        reason: 'Vehicle exceeds 7-year service life and 85,000 miles. High maintenance costs.',
        conditionRating: SurplusCondition.Fair,
        estimatedValue: 8500.00,
        costToRepair: 4200.00,
        recommendedDisposition: 'Public Auction',
        status: SurplusStatus.PENDING_REVIEW,
        createdBy: deptManager1.id,
      },
    }),
    // Pending approval
    prisma.surplusCase.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[10].id, // VEH-011 (2016 Silverado)
        reason: 'Out of service due to major mechanical failure. Repair cost exceeds replacement value.',
        conditionRating: SurplusCondition.Poor,
        estimatedValue: 6000.00,
        costToRepair: 8500.00,
        recommendedDisposition: 'Salvage/Parts',
        status: SurplusStatus.PENDING_APPROVAL,
        currentApproverRole: 'FLEET_MANAGER',
        createdBy: fleetManager1.id,
      },
    }),
    // Approved case
    prisma.surplusCase.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[17].id, // VEH-018 (2015 Fusion)
        reason: 'Reached end of lifecycle. Cost-effective to replace.',
        conditionRating: SurplusCondition.Good,
        estimatedValue: 7200.00,
        costToRepair: 1500.00,
        recommendedDisposition: 'Public Auction',
        status: SurplusStatus.APPROVED,
        createdBy: orgAdmin.id,
      },
    }),
    // Another approved case
    prisma.surplusCase.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[14].id, // VEH-015 (2017 Silverado in repair)
        reason: 'Critical safety incident. Vehicle deemed unsafe for continued operation.',
        conditionRating: SurplusCondition.Poor,
        estimatedValue: 9500.00,
        costToRepair: 12000.00,
        recommendedDisposition: 'Salvage',
        status: SurplusStatus.APPROVED,
        createdBy: deptManager3.id,
      },
    }),
  ])

  console.log('✓ Created 4 surplus cases')

  // ============================================================================
  // CREATE SURPLUS APPROVALS
  // ============================================================================

  const surplusApprovals = await Promise.all([
    // Approval for VEH-018
    prisma.surplusApproval.create({
      data: {
        surplusCaseId: surplusCases[2].id,
        approverId: fleetManager1.id,
        roleAtApproval: 'FLEET_MANAGER',
        decision: SurplusApprovalDecision.APPROVED,
        comments: 'Vehicle condition supports auction disposition. Approved for surplus.',
      },
    }),
    prisma.surplusApproval.create({
      data: {
        surplusCaseId: surplusCases[2].id,
        approverId: orgAdmin.id,
        roleAtApproval: 'ORG_ADMIN',
        decision: SurplusApprovalDecision.APPROVED,
        comments: 'Final approval granted. Proceed with auction process.',
      },
    }),
    // Approval for VEH-015
    prisma.surplusApproval.create({
      data: {
        surplusCaseId: surplusCases[3].id,
        approverId: fleetManager1.id,
        roleAtApproval: 'FLEET_MANAGER',
        decision: SurplusApprovalDecision.APPROVED,
        comments: 'Safety concerns validated. Recommend immediate surplus.',
      },
    }),
    prisma.surplusApproval.create({
      data: {
        surplusCaseId: surplusCases[3].id,
        approverId: orgAdmin.id,
        roleAtApproval: 'ORG_ADMIN',
        decision: SurplusApprovalDecision.APPROVED,
        comments: 'Approved for salvage disposition due to safety concerns.',
      },
    }),
  ])

  console.log('✓ Created 4 surplus approvals')

  // ============================================================================
  // CREATE MAINTENANCE PLANS
  // ============================================================================

  const maintenancePlans = await Promise.all([
    // VEH-001 plans
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[0].id,
        planType: 'Oil Change',
        intervalMiles: 5000,
        intervalDays: 180,
        lastServiceDate: daysAgo(120),
        lastServiceMiles: 10234,
        nextDueDate: daysFromNow(60),
        nextDueMiles: 15234,
        createdBy: fleetManager1.id,
      },
    }),
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[0].id,
        planType: 'Tire Rotation',
        intervalMiles: 7500,
        lastServiceDate: daysAgo(90),
        lastServiceMiles: 12234,
        nextDueDate: daysFromNow(30),
        nextDueMiles: 19734,
        createdBy: fleetManager1.id,
      },
    }),
    // VEH-002 plans
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[1].id,
        planType: 'DOT Inspection',
        intervalDays: 365,
        lastServiceDate: daysAgo(320),
        nextDueDate: daysFromNow(45),
        createdBy: fleetManager1.id,
      },
    }),
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[1].id,
        planType: 'Oil Change',
        intervalMiles: 7500,
        intervalDays: 180,
        lastServiceDate: daysAgo(200),
        lastServiceMiles: 21950,
        nextDueDate: daysAgo(20),
        nextDueMiles: 29450,
        createdBy: fleetManager1.id,
      },
    }),
    // VEH-005 plans
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[4].id,
        planType: 'Oil Change',
        intervalMiles: 7500,
        intervalDays: 180,
        lastServiceDate: daysAgo(160),
        lastServiceMiles: 34650,
        nextDueDate: daysFromNow(20),
        nextDueMiles: 42150,
        createdBy: fleetManager2.id,
      },
    }),
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[4].id,
        planType: 'Brake Inspection',
        intervalMiles: 15000,
        lastServiceDate: daysAgo(250),
        lastServiceMiles: 27150,
        nextDueDate: daysAgo(10),
        nextDueMiles: 42150,
        createdBy: fleetManager2.id,
      },
    }),
    // VEH-008 plans
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[7].id,
        planType: 'DOT Inspection',
        intervalDays: 365,
        lastServiceDate: daysAgo(10),
        nextDueDate: daysFromNow(355),
        createdBy: complianceOfficer1.id,
      },
    }),
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[7].id,
        planType: 'Oil Change',
        intervalMiles: 7500,
        intervalDays: 180,
        lastServiceDate: daysAgo(80),
        lastServiceMiles: 24200,
        nextDueDate: daysFromNow(100),
        nextDueMiles: 31700,
        createdBy: fleetManager2.id,
      },
    }),
    // VEH-012 plans
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[11].id,
        planType: 'Oil Change',
        intervalMiles: 5000,
        intervalDays: 180,
        lastServiceDate: daysAgo(45),
        lastServiceMiles: 10450,
        nextDueDate: daysFromNow(135),
        nextDueMiles: 15450,
        createdBy: fleetManager1.id,
      },
    }),
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[11].id,
        planType: 'Transmission Service',
        intervalMiles: 30000,
        lastServiceDate: daysAgo(200),
        lastServiceMiles: 7450,
        nextDueDate: daysFromNow(200),
        nextDueMiles: 37450,
        createdBy: fleetManager1.id,
      },
    }),
    // VEH-016 plans
    prisma.maintenancePlan.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[15].id,
        planType: 'Hybrid System Inspection',
        intervalMiles: 10000,
        intervalDays: 365,
        lastServiceDate: daysAgo(180),
        lastServiceMiles: 9250,
        nextDueDate: daysFromNow(185),
        nextDueMiles: 19250,
        createdBy: fleetManager2.id,
      },
    }),
  ])

  console.log('✓ Created 11 maintenance plans')

  // ============================================================================
  // CREATE WORK ORDERS
  // ============================================================================

  const workOrders = await Promise.all([
    // Completed work orders
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[0].id,
        maintenancePlanId: maintenancePlans[0].id,
        description: 'Routine oil change and filter replacement',
        status: WorkOrderStatus.COMPLETED,
        cost: 85.50,
        completedAt: daysAgo(5),
        createdBy: fleetManager1.id,
      },
    }),
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[7].id,
        maintenancePlanId: maintenancePlans[6].id,
        description: 'Annual DOT inspection - passed',
        status: WorkOrderStatus.COMPLETED,
        cost: 175.00,
        completedAt: daysAgo(10),
        createdBy: complianceOfficer1.id,
      },
    }),
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[11].id,
        description: 'Repair collision damage from incident',
        status: WorkOrderStatus.COMPLETED,
        cost: 8900.00,
        completedAt: daysAgo(15),
        createdBy: fleetManager1.id,
      },
    }),
    // In progress work orders
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[2].id,
        description: 'Investigate transmission slipping issue',
        status: WorkOrderStatus.IN_PROGRESS,
        cost: 2500.00,
        createdBy: fleetManager1.id,
      },
    }),
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[14].id,
        description: 'Replace brake system - safety critical',
        status: WorkOrderStatus.IN_PROGRESS,
        cost: 3200.00,
        createdBy: deptManager3.id,
      },
    }),
    // Pending work orders
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[1].id,
        maintenancePlanId: maintenancePlans[3].id,
        description: 'Overdue oil change service',
        status: WorkOrderStatus.PENDING,
        createdBy: fleetManager1.id,
      },
    }),
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[4].id,
        maintenancePlanId: maintenancePlans[5].id,
        description: 'Brake inspection and service',
        status: WorkOrderStatus.PENDING,
        createdBy: fleetManager2.id,
      },
    }),
    prisma.workOrder.create({
      data: {
        orgId: organization.id,
        vehicleId: vehicles[5].id,
        description: 'Replace damaged rear bumper from incident',
        status: WorkOrderStatus.PENDING,
        cost: 2800.00,
        createdBy: deptManager1.id,
      },
    }),
  ])

  console.log('✓ Created 8 work orders')

  // ============================================================================
  // CREATE AUDIT LOGS
  // ============================================================================

  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'Vehicle',
        entityId: vehicles[0].id,
        action: AuditAction.CREATE,
        afterSnapshot: { vehicleId: 'VEH-001', status: 'InService' },
        actorUserId: fleetManager1.id,
        ipAddress: '10.0.1.15',
        createdAt: daysAgo(450),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'Vehicle',
        entityId: vehicles[2].id,
        action: AuditAction.UPDATE,
        changedFields: { status: ['InService', 'InRepair'] },
        beforeSnapshot: { status: 'InService' },
        afterSnapshot: { status: 'InRepair' },
        actorUserId: fleetManager1.id,
        ipAddress: '10.0.1.15',
        createdAt: daysAgo(3),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'Driver',
        entityId: drivers[9].id,
        action: AuditAction.UPDATE,
        changedFields: { status: ['Active', 'Suspended'] },
        beforeSnapshot: { status: 'Active' },
        afterSnapshot: { status: 'Suspended' },
        actorUserId: deptManager2.id,
        ipAddress: '10.0.1.22',
        createdAt: daysAgo(30),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'Incident',
        entityId: incidents[0].id,
        action: AuditAction.CREATE,
        afterSnapshot: { severity: 'Low', atFault: true },
        actorUserId: fleetManager1.id,
        ipAddress: '10.0.1.15',
        createdAt: daysAgo(5),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'Incident',
        entityId: incidents[1].id,
        action: AuditAction.UPDATE,
        changedFields: { status: ['UNDER_REVIEW', 'CLOSED'] },
        beforeSnapshot: { status: 'UNDER_REVIEW' },
        afterSnapshot: { status: 'CLOSED' },
        actorUserId: deptManager1.id,
        ipAddress: '10.0.1.18',
        createdAt: daysAgo(8),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'SurplusCase',
        entityId: surplusCases[2].id,
        action: AuditAction.CREATE,
        afterSnapshot: { vehicleId: vehicles[17].id, status: 'PENDING_REVIEW' },
        actorUserId: orgAdmin.id,
        ipAddress: '10.0.1.10',
        createdAt: daysAgo(45),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'SurplusCase',
        entityId: surplusCases[2].id,
        action: AuditAction.UPDATE,
        changedFields: { status: ['PENDING_APPROVAL', 'APPROVED'] },
        beforeSnapshot: { status: 'PENDING_APPROVAL' },
        afterSnapshot: { status: 'APPROVED' },
        actorUserId: orgAdmin.id,
        ipAddress: '10.0.1.10',
        createdAt: daysAgo(30),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'WorkOrder',
        entityId: workOrders[0].id,
        action: AuditAction.CREATE,
        afterSnapshot: { description: 'Routine oil change', status: 'PENDING' },
        actorUserId: fleetManager1.id,
        ipAddress: '10.0.1.15',
        createdAt: daysAgo(10),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'WorkOrder',
        entityId: workOrders[0].id,
        action: AuditAction.UPDATE,
        changedFields: { status: ['PENDING', 'COMPLETED'] },
        beforeSnapshot: { status: 'PENDING' },
        afterSnapshot: { status: 'COMPLETED' },
        actorUserId: fleetManager1.id,
        ipAddress: '10.0.1.15',
        createdAt: daysAgo(5),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'ComplianceEvent',
        entityId: complianceEvents[0].id,
        action: AuditAction.CREATE,
        afterSnapshot: { status: 'CRITICAL', entityType: 'DRIVER' },
        actorUserId: complianceOfficer1.id,
        ipAddress: '10.0.1.20',
        createdAt: daysAgo(2),
      },
    }),
    prisma.auditLog.create({
      data: {
        orgId: organization.id,
        entityType: 'Vehicle',
        entityId: vehicles[10].id,
        action: AuditAction.UPDATE,
        changedFields: { status: ['InService', 'OutOfService'] },
        beforeSnapshot: { status: 'InService' },
        afterSnapshot: { status: 'OutOfService' },
        actorUserId: fleetManager1.id,
        ipAddress: '10.0.1.15',
        createdAt: daysAgo(60),
      },
    }),
  ])

  console.log('✓ Created 11 audit logs')

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('\n')
  console.log('=' .repeat(70))
  console.log('🎉 SEED COMPLETED SUCCESSFULLY')
  console.log('=' .repeat(70))
  console.log('\n📊 DATABASE SUMMARY:')
  console.log('  • 1 Organization: City of Atlanta — Department of Public Works')
  console.log('  • 5 Departments')
  console.log('  • 18 Users (various roles)')
  console.log('  • 21 Vehicles (various statuses and departments)')
  console.log('  • 15 Drivers (with compliance tracking)')
  console.log('  • 6 Compliance Rules')
  console.log('  • 16 Compliance Events (OK, WARNING, CRITICAL, OVERDUE)')
  console.log('  • 12 Incidents (various severities)')
  console.log('  • 4 Surplus Cases (with approvals)')
  console.log('  • 11 Maintenance Plans')
  console.log('  • 8 Work Orders')
  console.log('  • 11 Audit Logs')
  console.log('\n🔐 TEST CREDENTIALS:')
  console.log('  Password for all users: password123')
  console.log('\n  Admin Users:')
  console.log('    • admin@fleet.gov           (SUPER_ADMIN)')
  console.log('    • orgadmin@fleet.gov        (ORG_ADMIN)')
  console.log('\n  Fleet Managers:')
  console.log('    • fleetmanager@fleet.gov    (FLEET_MANAGER)')
  console.log('    • fleetmanager2@fleet.gov   (FLEET_MANAGER)')
  console.log('\n  Department Managers:')
  console.log('    • deptmgr1@fleet.gov        (DEPT_MANAGER - Parks & Recreation)')
  console.log('    • deptmgr2@fleet.gov        (DEPT_MANAGER - Water Management)')
  console.log('    • deptmgr3@fleet.gov        (DEPT_MANAGER - Public Safety)')
  console.log('\n  Compliance Officers:')
  console.log('    • compliance1@fleet.gov     (COMPLIANCE_OFFICER)')
  console.log('    • compliance2@fleet.gov     (COMPLIANCE_OFFICER)')
  console.log('\n  Read-Only Users:')
  console.log('    • readonly1@fleet.gov       (READ_ONLY)')
  console.log('    • readonly2@fleet.gov       (READ_ONLY)')
  console.log('    • readonly3@fleet.gov       (READ_ONLY)')
  console.log('\n  Driver Users:')
  console.log('    • driver1@fleet.gov         (DRIVER)')
  console.log('    • driver2@fleet.gov         (DRIVER)')
  console.log('    • driver3@fleet.gov         (DRIVER)')
  console.log('    • driver4@fleet.gov         (DRIVER)')
  console.log('    • driver5@fleet.gov         (DRIVER)')
  console.log('\n💡 KEY FEATURES TO TEST:')
  console.log('  • Compliance alerts (expiring insurance, CDL, medical certs)')
  console.log('  • Surplus workflow (vehicles pending review/approval)')
  console.log('  • Incident management (various severities and statuses)')
  console.log('  • Maintenance tracking (overdue services)')
  console.log('  • Work order management (pending, in-progress, completed)')
  console.log('  • Audit trail (entity changes tracked)')
  console.log('=' .repeat(70))
  console.log('\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
