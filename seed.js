const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function seed() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@mba.edu' } });
  if (!existing) {
    const password = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Admission Admin',
        email: 'admin@mba.edu',
        password,
        role: 'ADMIN'
      }
    });
    console.log('Admin created');
  } else {
    console.log('Admin exists');
  }
}
seed().catch(console.error).finally(() => prisma.$disconnect());
