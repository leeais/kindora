import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { Pool } from 'pg';

import { PrismaClient, UserRole } from '../src/db/generated/prisma/client';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = 'admin@gmail.com';
  const password = '12345678';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.warn('🌱 Bắt đầu seed dữ liệu...');

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      email,
      username: 'admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Admin',
      emailVerifiedAt: new Date(),
    },
  });

  console.warn('✅ Đã tạo/cập nhật tài khoản Admin:', admin.email);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Lỗi khi seed dữ liệu:', e);
  process.exit(1);
});
