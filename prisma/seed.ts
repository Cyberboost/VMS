import { PrismaClient, UserRole, VehicleStatus, DriverStatus, IncidentSeverity, IncidentStatus, SurplusCondition, SurplusStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.surplusRequest.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const adminPassword = await bcrypt.hash('password123', 10)
  const managerPassword = await bcrypt.hash('password123', 10)
  const viewerPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@fleet.gov',
      passwordHash: adminPassword,
      role: UserRole.Admin,
    },
  })

  const manager = await prisma.user.create({
    data: {
      name: 'Fleet Manager',
      email: 'manager@fleet.gov',
      passwordHash: managerPassword,
      role: UserRole.FleetManager,
    },
  })

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@fleet.gov',
      passwordHash: viewerPassword,
      role: UserRole.Viewer,
    },
  })

  console.log('✓ Created 3 users')

  // Create Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-001',
        vin: '1HGBH41JXMN109186',
        year: 2019,
        make: 'Ford',
        model: 'F-150',
        department: 'Public Works',
        division: 'Maintenance',
        status: VehicleStatus.InService,
        odometer: 45000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2019-03-15'),
        replacementTargetYear: 2027,
        lastDOTDate: new Date('2025-11-01'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-002',
        vin: '2T1BURHE0JC123456',
        year: 2018,
        make: 'Toyota',
        model: 'Camry',
        department: 'Administration',
        division: 'Executive',
        status: VehicleStatus.InService,
        odometer: 62000,
        fuelType: 'Hybrid',
        inServiceDate: new Date('2018-05-20'),
        replacementTargetYear: 2026,
        lastDOTDate: new Date('2025-10-15'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-003',
        vin: '3VWDP7AJ5EM123789',
        year: 2020,
        make: 'Chevrolet',
        model: 'Silverado',
        department: 'Parks & Recreation',
        division: 'Grounds',
        status: VehicleStatus.InRepair,
        odometer: 38000,
        fuelType: 'Diesel',
        inServiceDate: new Date('2020-01-10'),
        replacementTargetYear: 2028,
        lastDOTDate: new Date('2025-12-01'),
        notes: 'Transmission repair in progress',
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-004',
        vin: '5NPE24AF4JH123456',
        year: 2017,
        make: 'Honda',
        model: 'Accord',
        department: 'Police',
        division: 'Patrol',
        status: VehicleStatus.InService,
        odometer: 78000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2017-07-01'),
        replacementTargetYear: 2025,
        lastDOTDate: new Date('2025-09-20'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-005',
        vin: '1G1ZD5ST0LF123456',
        year: 2021,
        make: 'Ram',
        model: '1500',
        department: 'Fire',
        division: 'Emergency',
        status: VehicleStatus.InService,
        odometer: 25000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2021-02-15'),
        replacementTargetYear: 2029,
        lastDOTDate: new Date('2026-01-10'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-006',
        vin: 'WBADT43452G123456',
        year: 2016,
        make: 'Ford',
        model: 'Explorer',
        department: 'Public Safety',
        division: 'Administration',
        status: VehicleStatus.OutOfService,
        odometer: 95000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2016-04-10'),
        replacementTargetYear: 2024,
        lastDOTDate: new Date('2025-08-05'),
        notes: 'Engine issues - awaiting budget approval for replacement',
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-007',
        vin: '2HGFG3B50DH123456',
        year: 2019,
        make: 'Chevrolet',
        model: 'Tahoe',
        department: 'Public Works',
        division: 'Streets',
        status: VehicleStatus.InService,
        odometer: 52000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2019-06-01'),
        replacementTargetYear: 2027,
        lastDOTDate: new Date('2025-11-15'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-008',
        vin: 'JM1BL1S59A1123456',
        year: 2020,
        make: 'Ford',
        model: 'Transit',
        department: 'Parks & Recreation',
        division: 'Programs',
        status: VehicleStatus.InService,
        odometer: 41000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2020-03-20'),
        replacementTargetYear: 2028,
        lastDOTDate: new Date('2025-12-10'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-009',
        vin: '5XYZU3LB8FG123456',
        year: 2015,
        make: 'Dodge',
        model: 'Durango',
        department: 'Administration',
        division: 'Facilities',
        status: VehicleStatus.Surplus,
        odometer: 102000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2015-05-15'),
        replacementTargetYear: 2023,
        lastDOTDate: new Date('2025-07-01'),
        notes: 'High mileage - approved for surplus',
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-010',
        vin: '1FTEW1EP9KF123456',
        year: 2018,
        make: 'Ford',
        model: 'F-250',
        department: 'Public Works',
        division: 'Utilities',
        status: VehicleStatus.InService,
        odometer: 58000,
        fuelType: 'Diesel',
        inServiceDate: new Date('2018-08-10'),
        replacementTargetYear: 2026,
        lastDOTDate: new Date('2025-10-20'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-011',
        vin: '3C6JR7AT4EG123456',
        year: 2021,
        make: 'Chevrolet',
        model: 'Equinox',
        department: 'Health Services',
        division: 'Inspections',
        status: VehicleStatus.InService,
        odometer: 22000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2021-04-01'),
        replacementTargetYear: 2029,
        lastDOTDate: new Date('2026-01-15'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-012',
        vin: '1HGCR2F72EA123456',
        year: 2017,
        make: 'Honda',
        model: 'Civic',
        department: 'Code Enforcement',
        status: VehicleStatus.InService,
        odometer: 71000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2017-09-15'),
        replacementTargetYear: 2025,
        lastDOTDate: new Date('2025-09-30'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-013',
        vin: '5NPEB4AC8DH123456',
        year: 2022,
        make: 'Ford',
        model: 'Escape',
        department: 'Administration',
        division: 'IT',
        status: VehicleStatus.InService,
        odometer: 12000,
        fuelType: 'Hybrid',
        inServiceDate: new Date('2022-01-10'),
        replacementTargetYear: 2030,
        lastDOTDate: new Date('2026-02-01'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-014',
        vin: '1G1BE5SM7H7123456',
        year: 2019,
        make: 'Ram',
        model: '2500',
        department: 'Public Works',
        division: 'Sanitation',
        status: VehicleStatus.InRepair,
        odometer: 48000,
        fuelType: 'Diesel',
        inServiceDate: new Date('2019-07-20'),
        replacementTargetYear: 2027,
        lastDOTDate: new Date('2025-11-20'),
        notes: 'Brake system repair',
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-015',
        vin: 'WBXHT3C56F5J23456',
        year: 2018,
        make: 'Toyota',
        model: 'Tacoma',
        department: 'Parks & Recreation',
        division: 'Forestry',
        status: VehicleStatus.InService,
        odometer: 55000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2018-10-05'),
        replacementTargetYear: 2026,
        lastDOTDate: new Date('2025-10-25'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-016',
        vin: '1FAHP3K29CL123456',
        year: 2020,
        make: 'Chevrolet',
        model: 'Malibu',
        department: 'Human Resources',
        status: VehicleStatus.InService,
        odometer: 35000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2020-05-15'),
        replacementTargetYear: 2028,
        lastDOTDate: new Date('2025-12-15'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-017',
        vin: '3GNAXUEG3JL123456',
        year: 2016,
        make: 'Ford',
        model: 'Fusion',
        department: 'Finance',
        status: VehicleStatus.OutOfService,
        odometer: 89000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2016-06-20'),
        replacementTargetYear: 2024,
        lastDOTDate: new Date('2025-08-10'),
        notes: 'Multiple mechanical issues',
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-018',
        vin: '2HKRM4H70EH123456',
        year: 2021,
        make: 'Chevrolet',
        model: 'Colorado',
        department: 'Public Works',
        division: 'Engineering',
        status: VehicleStatus.InService,
        odometer: 28000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2021-06-01'),
        replacementTargetYear: 2029,
        lastDOTDate: new Date('2026-01-20'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-019',
        vin: 'JTDKARFU5H3123456',
        year: 2017,
        make: 'Honda',
        model: 'CR-V',
        department: 'Planning',
        status: VehicleStatus.InService,
        odometer: 67000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2017-11-10'),
        replacementTargetYear: 2025,
        lastDOTDate: new Date('2025-09-25'),
      },
    }),
    prisma.vehicle.create({
      data: {
        vehicleId: 'VEH-020',
        vin: '1N4AL3AP8JC123456',
        year: 2019,
        make: 'Ford',
        model: 'Edge',
        department: 'Parks & Recreation',
        division: 'Athletics',
        status: VehicleStatus.InService,
        odometer: 43000,
        fuelType: 'Gasoline',
        inServiceDate: new Date('2019-08-25'),
        replacementTargetYear: 2027,
        lastDOTDate: new Date('2025-11-25'),
      },
    }),
  ])

  console.log('✓ Created 20 vehicles')

  // Create Drivers
  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        driverId: 'DRV-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@fleet.gov',
        phone: '555-0101',
        department: 'Public Works',
        cdlNumber: 'CDL123456',
        cdlExpiration: new Date('2026-06-15'),
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@fleet.gov',
        phone: '555-0102',
        department: 'Parks & Recreation',
        cdlNumber: 'CDL234567',
        cdlExpiration: new Date('2026-03-20'),
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-003',
        firstName: 'Michael',
        lastName: 'Davis',
        email: 'michael.davis@fleet.gov',
        phone: '555-0103',
        department: 'Police',
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-004',
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily.brown@fleet.gov',
        phone: '555-0104',
        department: 'Fire',
        cdlNumber: 'CDL345678',
        cdlExpiration: new Date('2025-12-10'),
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-005',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@fleet.gov',
        phone: '555-0105',
        department: 'Public Works',
        cdlNumber: 'CDL456789',
        cdlExpiration: new Date('2026-09-05'),
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-006',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer.martinez@fleet.gov',
        phone: '555-0106',
        department: 'Administration',
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-007',
        firstName: 'Robert',
        lastName: 'Garcia',
        email: 'robert.garcia@fleet.gov',
        phone: '555-0107',
        department: 'Parks & Recreation',
        cdlNumber: 'CDL567890',
        cdlExpiration: new Date('2025-04-15'),
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-008',
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@fleet.gov',
        phone: '555-0108',
        department: 'Health Services',
        status: DriverStatus.Active,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-009',
        firstName: 'James',
        lastName: 'Taylor',
        email: 'james.taylor@fleet.gov',
        phone: '555-0109',
        department: 'Public Works',
        status: DriverStatus.Inactive,
      },
    }),
    prisma.driver.create({
      data: {
        driverId: 'DRV-010',
        firstName: 'Mary',
        lastName: 'Thomas',
        email: 'mary.thomas@fleet.gov',
        phone: '555-0110',
        department: 'Code Enforcement',
        status: DriverStatus.Active,
      },
    }),
  ])

  console.log('✓ Created 10 drivers')

  // Create Incidents
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-01-15'),
        description: 'Minor fender bender in parking lot',
        severity: IncidentSeverity.Low,
        atFault: false,
        department: 'Public Works',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-01-20'),
        description: 'Rear-ended at traffic light',
        severity: IncidentSeverity.Medium,
        atFault: true,
        department: 'Administration',
        status: IncidentStatus.Open,
        vehicleId: vehicles[1].id,
        driverId: drivers[5].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-01-25'),
        description: 'Tire blowout on highway',
        severity: IncidentSeverity.Medium,
        atFault: false,
        department: 'Parks & Recreation',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[2].id,
        driverId: drivers[1].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-02-01'),
        description: 'Hit parked vehicle while reversing',
        severity: IncidentSeverity.Low,
        atFault: true,
        department: 'Police',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[3].id,
        driverId: drivers[2].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-02-05'),
        description: 'Side-swiped by another vehicle',
        severity: IncidentSeverity.High,
        atFault: false,
        department: 'Fire',
        status: IncidentStatus.Open,
        vehicleId: vehicles[4].id,
        driverId: drivers[3].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2025-12-10'),
        description: 'Windshield cracked by road debris',
        severity: IncidentSeverity.Low,
        atFault: false,
        department: 'Public Works',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[6].id,
        driverId: drivers[4].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2025-12-20'),
        description: 'Door damaged in parking garage',
        severity: IncidentSeverity.Medium,
        atFault: true,
        department: 'Parks & Recreation',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[7].id,
        driverId: drivers[6].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-01-05'),
        description: 'Engine failure due to lack of maintenance',
        severity: IncidentSeverity.Critical,
        atFault: false,
        department: 'Administration',
        status: IncidentStatus.Open,
        vehicleId: vehicles[5].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-01-10'),
        description: 'Hit curb, damaged wheel and tire',
        severity: IncidentSeverity.Low,
        atFault: true,
        department: 'Public Works',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[9].id,
        driverId: drivers[4].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-01-30'),
        description: 'Collision at intersection',
        severity: IncidentSeverity.High,
        atFault: true,
        department: 'Health Services',
        status: IncidentStatus.Open,
        vehicleId: vehicles[10].id,
        driverId: drivers[7].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2025-11-15'),
        description: 'Scraped bumper on concrete barrier',
        severity: IncidentSeverity.Low,
        atFault: true,
        department: 'Code Enforcement',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[11].id,
        driverId: drivers[9].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-02-03'),
        description: 'Break-in, window smashed',
        severity: IncidentSeverity.Medium,
        atFault: false,
        department: 'Administration',
        status: IncidentStatus.Open,
        vehicleId: vehicles[12].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2025-12-28'),
        description: 'Transmission failure',
        severity: IncidentSeverity.Critical,
        atFault: false,
        department: 'Public Works',
        status: IncidentStatus.Open,
        vehicleId: vehicles[13].id,
        driverId: drivers[0].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-01-18'),
        description: 'Hit by shopping cart, minor dent',
        severity: IncidentSeverity.Low,
        atFault: false,
        department: 'Parks & Recreation',
        status: IncidentStatus.Closed,
        vehicleId: vehicles[14].id,
        driverId: drivers[1].id,
      },
    }),
    prisma.incident.create({
      data: {
        incidentDate: new Date('2026-02-08'),
        description: 'Front-end collision',
        severity: IncidentSeverity.Critical,
        atFault: true,
        department: 'Finance',
        status: IncidentStatus.Open,
        vehicleId: vehicles[16].id,
      },
    }),
  ])

  console.log('✓ Created 15 incidents')

  // Create Surplus Requests
  const surplusRequests = await Promise.all([
    prisma.surplusRequest.create({
      data: {
        vehicleId: vehicles[8].id,
        requestedBy: manager.id,
        condition: SurplusCondition.Fair,
        reason: 'High mileage (102,000 miles) - no longer cost-effective to maintain',
        status: SurplusStatus.Approved,
        notes: 'Vehicle suitable for public auction',
        approvedBy: admin.id,
        approvedAt: new Date('2026-01-15'),
      },
    }),
    prisma.surplusRequest.create({
      data: {
        vehicleId: vehicles[5].id,
        requestedBy: manager.id,
        condition: SurplusCondition.Poor,
        reason: 'Multiple engine issues, repair costs exceed vehicle value',
        status: SurplusStatus.Requested,
        notes: 'Awaiting approval from supervisor',
      },
    }),
    prisma.surplusRequest.create({
      data: {
        vehicleId: vehicles[16].id,
        requestedBy: manager.id,
        condition: SurplusCondition.Poor,
        reason: 'Mechanical issues and high repair costs',
        status: SurplusStatus.Approved,
        notes: 'Recommend for salvage',
        approvedBy: admin.id,
        approvedAt: new Date('2026-01-20'),
      },
    }),
    prisma.surplusRequest.create({
      data: {
        vehicleId: vehicles[3].id,
        requestedBy: manager.id,
        condition: SurplusCondition.Good,
        reason: 'Department is downsizing fleet',
        status: SurplusStatus.Auction,
        notes: 'Currently listed on GovDeals',
        approvedBy: admin.id,
        approvedAt: new Date('2026-01-10'),
      },
    }),
    prisma.surplusRequest.create({
      data: {
        vehicleId: vehicles[11].id,
        requestedBy: manager.id,
        condition: SurplusCondition.Good,
        reason: 'Replacing with electric vehicles',
        status: SurplusStatus.Requested,
        notes: 'Part of green initiative',
      },
    }),
  ])

  console.log('✓ Created 5 surplus requests')

  // Create some audit logs
  await prisma.auditLog.create({
    data: {
      entityType: 'Vehicle',
      entityId: vehicles[0].id,
      action: 'UPDATE',
      changes: { odometer: { from: 44000, to: 45000 } },
      actorId: manager.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'SurplusRequest',
      entityId: surplusRequests[0].id,
      action: 'APPROVE',
      changes: { status: { from: 'Requested', to: 'Approved' } },
      actorId: admin.id,
    },
  })

  console.log('✓ Created audit logs')
  console.log('\n✅ Seed completed successfully!')
  console.log('\nTest Users:')
  console.log('  admin@fleet.gov / password123')
  console.log('  manager@fleet.gov / password123')
  console.log('  viewer@fleet.gov / password123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
