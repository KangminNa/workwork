import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ADMIN 계정 생성
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@workwork.com' },
    update: {},
    create: {
      email: 'admin@workwork.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  console.log('✅ ADMIN 계정 생성 완료');
  console.log('📧 Email: admin@workwork.com');
  console.log('🔑 Password: admin123');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

