import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database with 20 Fictional Applicants...');

  // Roles: ADMIN, OFFICER, APPLICANT
  
  // Create Rahul Sharma (Demo Applicant)
  const rahulUser = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@demo.com',
      password: 'password123', // In a real app this would be hashed
      role: 'APPLICANT'
    }
  });

  await prisma.applicant.create({
    data: {
      userId: rahulUser.id,
      applicantId: 'MBA20260001',
      status: 'AWAITING_ADMISSION_APPROVAL',
      eligibility: 'ELIGIBLE',
      interviewStatus: 'COMPLETED',
      application: {
        create: {
          class10Percentage: 82,
          class12Percentage: 78,
          gradPercentage: 76,
          examScore: 84
        }
      }
    }
  });

  // Seed remaining 19 applicants
  const statuses = [
    { s: 'SELECTED', e: 'ELIGIBLE', c10: 90, c12: 92 },
    { s: 'SELECTED', e: 'ELIGIBLE', c10: 88, c12: 89 },
    { s: 'REJECTED', e: 'ELIGIBLE', c10: 62, c12: 65 },
    { s: 'AWAITING_ADMISSION_APPROVAL', e: 'ELIGIBLE', c10: 80, c12: 81 },
    { s: 'INTERVIEW_PENDING', e: 'ELIGIBLE', c10: 75, c12: 76 },
    { s: 'INTERVIEW_PENDING', e: 'ELIGIBLE', c10: 71, c12: 72 },
    { s: 'MANUAL_REVIEW_REQUIRED', e: 'ELIGIBLE', c10: 65, c12: 66 },
    { s: 'MANUAL_REVIEW_REQUIRED', e: 'ELIGIBLE', c10: 68, c12: 67 },
    { s: 'NOT_ELIGIBLE', e: 'NOT ELIGIBLE', c10: 55, c12: 80 },
    { s: 'NOT_ELIGIBLE', e: 'NOT ELIGIBLE', c10: 80, c12: 59 },
    { s: 'NOT_ELIGIBLE', e: 'NOT ELIGIBLE', c10: 40, c12: 45 },
    // Fill remainder to 19 total mock users
    ...Array(8).fill({ s: 'SUBMITTED', e: null, c10: null, c12: null })
  ];

  let idCounter = 2;
  for (const st of statuses) {
    const mockUser = await prisma.user.create({
      data: {
        name: `Mock Applicant ${idCounter}`,
        email: `mock${idCounter}@demo.com`,
        password: 'password123',
        role: 'APPLICANT'
      }
    });

    await prisma.applicant.create({
      data: {
        userId: mockUser.id,
        applicantId: `MBA202600${idCounter.toString().padStart(2, '0')}`,
        status: st.s,
        eligibility: st.e,
        application: {
          create: {
            class10Percentage: st.c10,
            class12Percentage: st.c12,
            gradPercentage: 70,
            examScore: 80
          }
        }
      }
    });
    idCounter++;
  }

  // Create an Admission Officer
  await prisma.user.create({
    data: {
      name: 'Admission Officer',
      email: 'officer@university.edu',
      password: 'password123',
      role: 'OFFICER'
    }
  });

  // Create an Administrator
  await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@university.edu',
      password: 'password123',
      role: 'ADMIN'
    }
  });

  console.log('Database Seeding Complete! 20 Fictional Applicants created.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
