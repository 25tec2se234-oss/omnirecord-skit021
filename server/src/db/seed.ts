import bcrypt from 'bcryptjs';
import { prisma } from './client.js';

export async function seedDatabase() {
  console.log('🌱 Starting database seed for Pehchaan (SKIT021)...');

  // 1. Upsert Default Institution
  const institution = await prisma.institution.upsert({
    where: { code: 'SKIT-021' },
    update: {
      name: 'Swami Keshvanand Institute of Technology, Management & Gramothan',
      shortName: 'SKIT Jaipur',
      portalId: 'SKIT021-EDU-CLOUD',
      accreditation: 'Autonomous Engineering & Technology Framework (Demo Benchmark)',
      address: 'Ramnagaria, Jagatpura, Jaipur, Rajasthan 302017',
      adminEmail: 'studentaffairs@skit.ac.in'
    },
    create: {
      code: 'SKIT-021',
      name: 'Swami Keshvanand Institute of Technology, Management & Gramothan',
      shortName: 'SKIT Jaipur',
      portalId: 'SKIT021-EDU-CLOUD',
      accreditation: 'Autonomous Engineering & Technology Framework (Demo Benchmark)',
      address: 'Ramnagaria, Jagatpura, Jaipur, Rajasthan 302017',
      adminEmail: 'studentaffairs@skit.ac.in',
      academicYear: '2024 - 2025'
    }
  });

  console.log(`✅ Institution verified: ${institution.shortName} (${institution.code})`);

  // 2. Upsert Secondary Institution for Tenant Isolation Testing
  const secondInstitution = await prisma.institution.upsert({
    where: { code: 'MNIT-042' },
    update: {},
    create: {
      code: 'MNIT-042',
      name: 'Malaviya National Institute of Technology',
      shortName: 'MNIT Jaipur',
      portalId: 'MNIT042-EDU-CLOUD',
      accreditation: 'Institute of National Importance',
      address: 'JLN Marg, Jaipur, Rajasthan 302017',
      adminEmail: 'admin@mnit.ac.in',
      academicYear: '2024 - 2025'
    }
  });

  // Default hashed password for demo / seed accounts
  const defaultPasswordHash = await bcrypt.hash('DemoPassword2024!', 10);

  // 3. Upsert Users & Memberships
  // A. Platform Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@pehchaan.edu' },
    update: {},
    create: {
      email: 'superadmin@pehchaan.edu',
      passwordHash: defaultPasswordHash,
      fullName: 'Pehchaan Super Admin',
      isPlatformAdmin: true,
      emailVerified: true
    }
  });

  // B. SKIT Institution Admin
  const instAdminUser = await prisma.user.upsert({
    where: { email: 'studentaffairs@skit.ac.in' },
    update: {},
    create: {
      email: 'studentaffairs@skit.ac.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Dean of Student Affairs',
      emailVerified: true
    }
  });

  await prisma.institutionMembership.upsert({
    where: {
      institutionId_userId: {
        institutionId: institution.id,
        userId: instAdminUser.id
      }
    },
    update: { role: 'INSTITUTION_ADMIN' },
    create: {
      institutionId: institution.id,
      userId: instAdminUser.id,
      role: 'INSTITUTION_ADMIN'
    }
  });

  // C. Faculty Coordinators (support both cse.coordinator and coord.cs)
  const coordinatorUser = await prisma.user.upsert({
    where: { email: 'cse.coordinator@skit.ac.in' },
    update: {},
    create: {
      email: 'cse.coordinator@skit.ac.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Dr. Ananya Sharma',
      emailVerified: true
    }
  });

  const coordinatorUserAlt = await prisma.user.upsert({
    where: { email: 'coord.cs@skit.ac.in' },
    update: {},
    create: {
      email: 'coord.cs@skit.ac.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Dr. Ananya Sharma',
      emailVerified: true
    }
  });

  // D. Student Users (support both aarav.patel.22 and priya.sharma)
  const studentUser = await prisma.user.upsert({
    where: { email: 'aarav.patel.22@skit.ac.in' },
    update: {},
    create: {
      email: 'aarav.patel.22@skit.ac.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Aarav Patel',
      emailVerified: true
    }
  });

  const studentUserPriya = await prisma.user.upsert({
    where: { email: 'priya.sharma@skit.ac.in' },
    update: {},
    create: {
      email: 'priya.sharma@skit.ac.in',
      passwordHash: defaultPasswordHash,
      fullName: 'Priya Sharma',
      emailVerified: true
    }
  });

  // E. Auditor User
  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditor@rajasthan-gov.ac.in' },
    update: {},
    create: {
      email: 'auditor@rajasthan-gov.ac.in',
      passwordHash: defaultPasswordHash,
      fullName: 'State Accreditation Auditor',
      emailVerified: true
    }
  });

  await prisma.institutionMembership.upsert({
    where: {
      institutionId_userId: {
        institutionId: institution.id,
        userId: auditorUser.id
      }
    },
    update: { role: 'AUDITOR_VIEWER' },
    create: {
      institutionId: institution.id,
      userId: auditorUser.id,
      role: 'AUDITOR_VIEWER'
    }
  });

  // 4. Seed Departments
  const deptData = [
    { code: 'CSE', name: 'Computer Science & Engineering', coordinatorName: 'Dr. Ananya Sharma', coordinatorEmail: 'cse.coordinator@skit.ac.in', description: 'Department overseeing software, algorithmic engineering, and computing labs.' },
    { code: 'IT', name: 'Information Technology', coordinatorName: 'Prof. Rajesh Kumar', coordinatorEmail: 'it.coordinator@skit.ac.in', description: 'Focus on cloud computing, web infrastructure, and enterprise architectures.' },
    { code: 'ECE', name: 'Electronics & Communication', coordinatorName: 'Dr. Vikram Seth', coordinatorEmail: 'ece.coordinator@skit.ac.in', description: 'Specialized in embedded systems, IoT, robotics, and wireless communications.' },
    { code: 'ME', name: 'Mechanical Engineering', coordinatorName: 'Prof. Sunil Joshi', coordinatorEmail: 'me.coordinator@skit.ac.in', description: 'Focus on automotive systems, CAD/CAM robotics, and manufacturing engineering.' },
    { code: 'CE', name: 'Civil Engineering', coordinatorName: 'Dr. Meenakshi Sundaram', coordinatorEmail: 'ce.coordinator@skit.ac.in', description: 'Urban planning, environmental remediation, and structural engineering.' },
    { code: 'BT', name: 'Biotechnology & Bioinformatics', coordinatorName: 'Dr. Priya Nair', coordinatorEmail: 'bt.coordinator@skit.ac.in', description: 'Research in computational genomics, healthcare bioprocesses, and bio-design.' },
    { code: 'MBA', name: 'Department of Management Studies', coordinatorName: 'Prof. Harish Verma', coordinatorEmail: 'mba.coordinator@skit.ac.in', description: 'Business analytics, institutional leadership, and entrepreneurship.' }
  ];

  const deptMap = new Map<string, string>();

  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: {
        institutionId_code: {
          institutionId: institution.id,
          code: d.code
        }
      },
      update: {
        name: d.name,
        coordinatorName: d.coordinatorName,
        coordinatorEmail: d.coordinatorEmail,
        description: d.description
      },
      create: {
        institutionId: institution.id,
        code: d.code,
        name: d.name,
        coordinatorName: d.coordinatorName,
        coordinatorEmail: d.coordinatorEmail,
        description: d.description
      }
    });
    deptMap.set(d.code, dept.id);
  }

  // Link Coordinator to CSE department
  const cseDeptId = deptMap.get('CSE');
  await prisma.institutionMembership.upsert({
    where: {
      institutionId_userId: {
        institutionId: institution.id,
        userId: coordinatorUser.id
      }
    },
    update: {
      role: 'FACULTY_COORDINATOR',
      departmentId: cseDeptId
    },
    create: {
      institutionId: institution.id,
      userId: coordinatorUser.id,
      role: 'FACULTY_COORDINATOR',
      departmentId: cseDeptId
    }
  });

  await prisma.institutionMembership.upsert({
    where: {
      institutionId_userId: {
        institutionId: institution.id,
        userId: coordinatorUserAlt.id
      }
    },
    update: {
      role: 'FACULTY_COORDINATOR',
      departmentId: cseDeptId
    },
    create: {
      institutionId: institution.id,
      userId: coordinatorUserAlt.id,
      role: 'FACULTY_COORDINATOR',
      departmentId: cseDeptId
    }
  });

  // Link Student User to Membership
  await prisma.institutionMembership.upsert({
    where: {
      institutionId_userId: {
        institutionId: institution.id,
        userId: studentUser.id
      }
    },
    update: { role: 'STUDENT', departmentId: cseDeptId },
    create: {
      institutionId: institution.id,
      userId: studentUser.id,
      role: 'STUDENT',
      departmentId: cseDeptId
    }
  });

  await prisma.institutionMembership.upsert({
    where: {
      institutionId_userId: {
        institutionId: institution.id,
        userId: studentUserPriya.id
      }
    },
    update: { role: 'STUDENT', departmentId: cseDeptId },
    create: {
      institutionId: institution.id,
      userId: studentUserPriya.id,
      role: 'STUDENT',
      departmentId: cseDeptId
    }
  });

  // 5. Seed Students
  const studentsData = [
    { studentId: 'SKIT-2022-CS014', name: 'Aarav Patel', email: 'aarav.patel.22@skit.ac.in', deptCode: 'CSE', program: 'B.Tech Computer Science', year: '3rd Year', cgpa: '9.2', phone: '+91 98201 44521', bio: 'Passionate about competitive programming and AI.', userId: studentUser.id },
    { studentId: 'SKIT-2022-EC031', name: 'Diya Sengupta', email: 'diya.sengupta.22@skit.ac.in', deptCode: 'ECE', program: 'B.Tech Electronics & Comm', year: '3rd Year', cgpa: '8.9', phone: '+91 98112 33490', bio: 'Robotics club president. Built autonomous maze solvers.' },
    { studentId: 'SKIT-2023-CS042', name: 'Rohan Deshmukh', email: 'rohan.deshmukh.23@skit.ac.in', deptCode: 'CSE', program: 'B.Tech Computer Science', year: '2nd Year', cgpa: '8.4', phone: '+91 97204 88102', bio: 'Full-stack developer and open source enthusiast.' },
    { studentId: 'SKIT-2021-IT009', name: 'Sneha Kulkarni', email: 'sneha.kulkarni.21@skit.ac.in', deptCode: 'IT', program: 'B.Tech Information Tech', year: '4th Year', cgpa: '9.5', phone: '+91 99301 22894', bio: 'Head of Student Cultural Affairs and classical dancer.' },
    { studentId: 'SKIT-2022-ME019', name: 'Kabir Mehra', email: 'kabir.mehra.22@skit.ac.in', deptCode: 'ME', program: 'B.Tech Mechanical Engg', year: '3rd Year', cgpa: '7.9', phone: '+91 98402 77154', bio: 'University Athletics Captain, State 400m sprinter.' },
    { studentId: 'SKIT-2023-CE015', name: 'Ananya Roy', email: 'ananya.roy.23@skit.ac.in', deptCode: 'CE', program: 'B.Tech Civil Engineering', year: '2nd Year', cgpa: '8.6', phone: '+91 97120 44901', bio: 'NSS Youth Coordinator involved in municipal water audits.' },
    { studentId: 'SKIT-2023-CS088', name: 'Tanmay Bhatia', email: 'tanmay.bhatia.23@skit.ac.in', deptCode: 'CSE', program: 'B.Tech Computer Science', year: '2nd Year', cgpa: '8.2', phone: '+91 96500 11209', bio: 'Cybersecurity enthusiast and penetration tester.' },
    { studentId: 'SKIT-2024-IT022', name: 'Ishita Gupta', email: 'ishita.gupta.24@skit.ac.in', deptCode: 'IT', program: 'B.Tech Information Tech', year: '1st Year', cgpa: '9.0', phone: '+91 98100 88201', bio: 'First-year developer exploring mobile apps.' },
    { studentId: 'SKIT-2021-EC004', name: 'Vikramaditya Rao', email: 'vikram.rao.21@skit.ac.in', deptCode: 'ECE', program: 'B.Tech Electronics & Comm', year: '4th Year', cgpa: '8.1', phone: '+91 98801 33499', bio: 'Semiconductor architecture enthusiast.' },
    { studentId: 'SKIT-2022-BT008', name: 'Meera Pillai', email: 'meera.pillai.22@skit.ac.in', deptCode: 'BT', program: 'B.Tech Biotechnology', year: '3rd Year', cgpa: '9.3', phone: '+91 97401 55620', bio: 'Focuses on CRISPR algorithms and targeted enzyme discovery.' },
    { studentId: 'SKIT-2023-MB003', name: 'Arjun Nair', email: 'arjun.nair.23@skit.ac.in', deptCode: 'MBA', program: 'MBA Innovation & Venture', year: '2nd Year', cgpa: '8.7', phone: '+91 99400 66712', bio: 'E-Cell leader facilitating startup incubation.' },
    { studentId: 'SKIT-2021-CS002', name: 'Kavya Menon', email: 'kavya.menon.21@skit.ac.in', deptCode: 'CSE', program: 'B.Tech Computer Science', year: '4th Year', cgpa: '9.6', phone: '+91 98119 22310', bio: 'Lead student developer on institutional portal.' }
  ];

  const studentMap = new Map<string, string>();

  for (const s of studentsData) {
    const deptId = deptMap.get(s.deptCode) || cseDeptId!;
    const profile = await prisma.studentProfile.upsert({
      where: {
        institutionId_studentId: {
          institutionId: institution.id,
          studentId: s.studentId
        }
      },
      update: {
        name: s.name,
        email: s.email,
        departmentId: deptId,
        program: s.program,
        year: s.year,
        cgpa: s.cgpa,
        phone: s.phone,
        bio: s.bio
      },
      create: {
        institutionId: institution.id,
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        departmentId: deptId,
        program: s.program,
        year: s.year,
        cgpa: s.cgpa,
        phone: s.phone,
        bio: s.bio,
        userId: s.userId
      }
    });
    studentMap.set(s.studentId, profile.id);
  }

  // 6. Seed Activities
  const activitiesData = [
    { code: 'ACT-101', name: 'Smart India Hackathon 2024 Institutional Round', category: 'Technical', deptCode: 'CSE', startDate: new Date('2024-03-01'), endDate: new Date('2024-03-03'), venue: 'Main Campus Auditorium & Labs', coordinator: 'Dr. Ananya Sharma', status: 'Completed' as const, maxParticipants: 150, description: 'Annual 36-hour hackathon to build software and hardware solutions.' },
    { code: 'ACT-102', name: 'Inter-College Robotics Championship (RoboClash)', category: 'Technical', deptCode: 'ECE', startDate: new Date('2024-02-15'), endDate: new Date('2024-02-16'), venue: 'Robotics Arena, Block C', coordinator: 'Dr. Vikram Seth', status: 'Completed' as const, maxParticipants: 80, description: 'State-wide autonomous line follower and battle bot competition.' },
    { code: 'ACT-103', name: 'National Conference on AI & Sustainable Tech', category: 'Research', deptCode: 'CSE', startDate: new Date('2024-03-20'), endDate: new Date('2024-03-21'), venue: 'Convention Center Hall A', coordinator: 'Dr. Ananya Sharma', status: 'Completed' as const, maxParticipants: 200, description: 'Peer-reviewed research presentations focusing on edge intelligence.' },
    { code: 'ACT-104', name: 'Annual Cultural Fest - Rhythm 2024', category: 'Cultural', deptCode: 'MBA', startDate: new Date('2024-04-05'), endDate: new Date('2024-04-07'), venue: 'Open Air Amphitheatre', coordinator: 'Prof. Harish Verma', status: 'Completed' as const, maxParticipants: 600, description: '3-day flagship festival spanning music, dance, theater, and arts.' },
    { code: 'ACT-105', name: 'Inter-University Track & Field Championship', category: 'Sports', deptCode: 'ME', startDate: new Date('2024-01-18'), endDate: new Date('2024-01-20'), venue: 'University Sports Grounds', coordinator: 'Prof. Sunil Joshi', status: 'Completed' as const, maxParticipants: 250, description: 'Competitive sports meet covering 100m/400m sprint, relay, long jump.' },
    { code: 'ACT-106', name: 'Clean Campus & River Rejuvenation Drive', category: 'Volunteering', deptCode: 'CE', startDate: new Date('2024-02-28'), endDate: new Date('2024-02-28'), venue: 'East Bank Ecological Corridor', coordinator: 'Dr. Meenakshi Sundaram', status: 'Completed' as const, maxParticipants: 180, description: 'Environmental cleanup and community plastic audit drive.' },
    { code: 'ACT-107', name: 'Hands-on Flutter & Cloud Infrastructure Workshop', category: 'Workshop', deptCode: 'IT', startDate: new Date('2024-05-10'), endDate: new Date('2024-05-14'), venue: 'Virtual Google Meet & Lab 4', coordinator: 'Prof. Rajesh Kumar', status: 'Ongoing' as const, maxParticipants: 90, description: 'Intensive 4-day skill boot camp building cross-platform apps.' },
    { code: 'ACT-108', name: 'Bio-Genomics Innovation Pitch Challenge', category: 'Innovation', deptCode: 'BT', startDate: new Date('2024-06-02'), endDate: new Date('2024-06-03'), venue: 'Incubation Center Boardroom', coordinator: 'Dr. Priya Nair', status: 'Upcoming' as const, maxParticipants: 45, description: 'Student seed-stage presentation for bio-engineered healthcare solutions.' },
    { code: 'ACT-109', name: 'National Parliamentary Debate Championship', category: 'Extracurricular', deptCode: 'MBA', startDate: new Date('2024-03-28'), endDate: new Date('2024-03-29'), venue: 'Auditorium Hall 2', coordinator: 'Prof. Harish Verma', status: 'Completed' as const, maxParticipants: 64, description: 'Oxford-style parliamentary debates on technology regulation.' },
    { code: 'ACT-110', name: 'CyberSecurity Capture-The-Flag (CTF) Challenge', category: 'Technical', deptCode: 'CSE', startDate: new Date('2024-07-15'), endDate: new Date('2024-07-16'), venue: 'High Performance Computing Lab', coordinator: 'Dr. Ananya Sharma', status: 'Upcoming' as const, maxParticipants: 120, description: 'Reverse engineering, cryptography, and network exploit contest.' }
  ];

  const activityMap = new Map<string, string>();

  for (const a of activitiesData) {
    const deptId = deptMap.get(a.deptCode) || cseDeptId!;
    const act = await prisma.activity.upsert({
      where: {
        institutionId_code: {
          institutionId: institution.id,
          code: a.code
        }
      },
      update: {
        name: a.name,
        category: a.category,
        departmentId: deptId,
        startDate: a.startDate,
        endDate: a.endDate,
        venue: a.venue,
        coordinator: a.coordinator,
        status: a.status,
        maxParticipants: a.maxParticipants,
        description: a.description
      },
      create: {
        institutionId: institution.id,
        code: a.code,
        name: a.name,
        category: a.category,
        departmentId: deptId,
        startDate: a.startDate,
        endDate: a.endDate,
        venue: a.venue,
        coordinator: a.coordinator,
        status: a.status,
        maxParticipants: a.maxParticipants,
        description: a.description
      }
    });
    activityMap.set(a.code, act.id);
  }

  // 7. Seed Participation Records
  const recordsData = [
    { recordNumber: 'REC-2024-001', studentRegNo: 'SKIT-2022-CS014', actCode: 'ACT-101', deptCode: 'CSE', category: 'Technical', date: new Date('2024-03-03'), level: 'Winner', status: 'VERIFIED' as const, certRef: 'CERT-SIH24-089', notes: 'Verified against SIH institutional merit list. First place confirmed.', desc: 'Led team NeuralForge developing automated municipal grievance dispatch system using LLMs.' },
    { recordNumber: 'REC-2024-002', studentRegNo: 'SKIT-2022-EC031', actCode: 'ACT-102', deptCode: 'ECE', category: 'Technical', date: new Date('2024-02-16'), level: 'Runner-up', status: 'VERIFIED' as const, certRef: 'CERT-ROBO-411', notes: 'Second place in high-speed autonomous navigation track verified.', desc: 'Designed custom PID algorithm and chassis telemetry for 2.4kg competitive bot.' },
    { recordNumber: 'REC-2024-003', studentRegNo: 'SKIT-2023-CS042', actCode: 'ACT-103', deptCode: 'CSE', category: 'Research', date: new Date('2024-03-21'), level: 'Participant', status: 'PENDING_REVIEW' as const, certRef: 'CERT-CONF-052', notes: 'Awaiting co-author endorsement and conference proceeding DOI indexation.', desc: 'Oral presentation on Decentralized Federated Learning for Smart Grid Load Optimization.' },
    { recordNumber: 'REC-2024-004', studentRegNo: 'SKIT-2021-IT009', actCode: 'ACT-104', deptCode: 'MBA', category: 'Cultural', date: new Date('2024-04-07'), level: 'Winner', status: 'VERIFIED' as const, certRef: 'CERT-RHY-104', notes: 'Awarded 1st Prize in Classical Bharatnatyam Solo Competition.', desc: 'Solo classical dance performance representing the School of Computing.' },
    { recordNumber: 'REC-2024-005', studentRegNo: 'SKIT-2022-ME019', actCode: 'ACT-105', deptCode: 'ME', category: 'Sports', date: new Date('2024-01-20'), level: 'Winner', status: 'VERIFIED' as const, certRef: 'CERT-ATH-007', notes: 'Gold medal in 400m sprint with institutional record timing 48.92s.', desc: 'Gold medalist in Mens 400m Track event.' },
    { recordNumber: 'REC-2024-006', studentRegNo: 'SKIT-2023-CE015', actCode: 'ACT-106', deptCode: 'CE', category: 'Volunteering', date: new Date('2024-02-28'), level: 'Participant', status: 'VERIFIED' as const, certRef: 'CERT-NSS-209', notes: 'Completed 18 verified field hours in riparian embankment restoration.', desc: 'Organized student squad for biological waste sampling and riverbank disposal.' },
    { recordNumber: 'REC-2024-007', studentRegNo: 'SKIT-2023-CS088', actCode: 'ACT-101', deptCode: 'CSE', category: 'Technical', date: new Date('2024-03-03'), level: 'Finalist', status: 'PENDING_REVIEW' as const, certRef: 'CERT-SIH24-192', notes: 'Queued for mentor verification regarding hardware schematic validation.', desc: 'Developed LoRaWAN telemetry prototype for agricultural soil nutrient tracking.' },
    { recordNumber: 'REC-2024-008', studentRegNo: 'SKIT-2024-IT022', actCode: 'ACT-107', deptCode: 'IT', category: 'Workshop', date: new Date('2024-05-14'), level: 'Participant', status: 'NEEDS_CORRECTION' as const, certRef: 'CERT-FLUTTER-31', notes: 'Please upload the official certificate of completion signed by the instructor.', desc: '4-day hands-on workshop building mobile apps with state management.' },
    { recordNumber: 'REC-2024-009', studentRegNo: 'SKIT-2021-EC004', actCode: 'ACT-102', deptCode: 'ECE', category: 'Technical', date: new Date('2024-02-16'), level: 'Participant', status: 'REJECTED' as const, certRef: 'CERT-ROBO-992', notes: 'The uploaded file is an admission audience ticket. It does not certify participation.', desc: 'Attended robotics contest as observer and bench tester.' },
    { recordNumber: 'REC-2024-010', studentRegNo: 'SKIT-2022-BT008', actCode: 'ACT-108', deptCode: 'BT', category: 'Innovation', date: new Date('2024-06-03'), level: 'Winner', status: 'PENDING_REVIEW' as const, certRef: 'CERT-BIO-012', notes: 'Under review by Institutional Patent & Innovation cell committee.', desc: 'Awarded Best Biotech Innovation for Algal Cellulose Bioplastics.' }
  ];

  for (const r of recordsData) {
    const studentProfileId = studentMap.get(r.studentRegNo);
    const activityId = activityMap.get(r.actCode);
    const deptId = deptMap.get(r.deptCode) || cseDeptId!;

    if (!studentProfileId || !activityId) continue;

    const rec = await prisma.participationRecord.upsert({
      where: {
        institutionId_recordNumber: {
          institutionId: institution.id,
          recordNumber: r.recordNumber
        }
      },
      update: {
        achievementLevel: r.level,
        verificationStatus: r.status,
        certificateRef: r.certRef,
        description: r.desc
      },
      create: {
        institutionId: institution.id,
        recordNumber: r.recordNumber,
        studentProfileId,
        activityId,
        departmentId: deptId,
        category: r.category,
        participationDate: r.date,
        achievementLevel: r.level,
        certificateRef: r.certRef,
        description: r.desc,
        verificationStatus: r.status
      }
    });

    // Record review if verified or reviewed
    if (r.status !== 'PENDING_REVIEW') {
      await prisma.verificationReview.create({
        data: {
          institutionId: institution.id,
          recordId: rec.id,
          reviewerUserId: coordinatorUser.id,
          reviewerName: 'Dr. Ananya Sharma',
          reviewerDepartment: 'Computer Science & Engineering',
          previousStatus: 'PENDING_REVIEW',
          newStatus: r.status,
          decisionNotes: r.notes
        }
      });
    }
  }

  // 8. Seed Subscription
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await prisma.subscription.upsert({
    where: { institutionId: institution.id },
    update: {},
    create: {
      institutionId: institution.id,
      plan: 'CAMPUS_PRO',
      status: 'ACTIVE',
      currentPeriodEnd: oneYearFromNow,
      maxStudents: 5000,
      maxActivities: 1000
    }
  });

  // 9. Seed Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        institutionId: institution.id,
        title: 'Participation Record Awaiting Review',
        message: 'Rohan Deshmukh submitted research paper presentation evidence for ACT-103.',
        type: 'info',
        read: false,
        targetPage: 'verification'
      },
      {
        institutionId: institution.id,
        title: 'Correction Requested by Coordinator',
        message: 'Prof. Rajesh Kumar requested re-upload of official workshop credential for Ishita Gupta.',
        type: 'warning',
        read: false,
        targetPage: 'records'
      },
      {
        institutionId: institution.id,
        title: 'Achievement Successfully Verified',
        message: 'Dr. Ananya Sharma verified Aarav Patels SIH 2024 Winner credential.',
        type: 'success',
        read: true,
        targetPage: 'verification'
      }
    ],
    skipDuplicates: true
  });

  console.log('🎉 Seed completed successfully!');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .catch((e) => {
      console.error('❌ Seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
