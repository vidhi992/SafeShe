import { db } from '../lib/db';

async function checkDatabaseUsers() {
  console.log('🔍 Checking SQLite Users Table...');
  try {
    const userCount = await db.user.count();
    console.log(`📊 Total Users in DB: ${userCount}`);

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        password: true,
      },
    });

    users.forEach((u, i) => {
      const isBcrypt = u.password.startsWith('$2a$') || u.password.startsWith('$2b$');
      console.log(`[${i + 1}] ID: ${u.id} | Email: "${u.email}" | Name: "${u.name}" | Role: ${u.role} | Valid Bcrypt Hash: ${isBcrypt} | Password Length: ${u.password.length}`);
    });

    const targetUser = await db.user.findUnique({
      where: { email: 'vidhijain382@gmail.com' },
    });

    if (targetUser) {
      console.log(`✅ Found user vidhijain382@gmail.com: ID=${targetUser.id}, Role=${targetUser.role}`);
    } else {
      console.log(`❌ User vidhijain382@gmail.com NOT found in current database.`);
    }
  } catch (err) {
    console.error('❌ Error reading database:', err);
  } finally {
    await db.$disconnect();
  }
}

checkDatabaseUsers();
