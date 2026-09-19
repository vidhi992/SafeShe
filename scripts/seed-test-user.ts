import { db } from '../lib/db';
import bcrypt from 'bcryptjs';

async function seedTestUser() {
  console.log('🌱 Seeding test user test@safeshe.local...');
  try {
    const email = 'test@safeshe.local';
    const existing = await db.user.findUnique({ where: { email } });

    if (existing) {
      console.log('✅ Test user test@safeshe.local already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('Test@12345', 12);
    const user = await db.user.create({
      data: {
        name: 'Test User',
        email,
        password: hashedPassword,
        role: 'USER',
        phone: '+91 99999 88888',
        profile: {
          create: {
            bloodGroup: 'O+',
            addressHome: 'Delhi, India',
          },
        },
        privacySetting: {
          create: {
            shareLocationWithHelper: true,
            allowVoiceTrigger: true,
            allowAnonymousReporting: true,
            retentionDays: 365,
          },
        },
      },
    });

    console.log(`🎉 Successfully created test user: ID=${user.id}, Email=${user.email}, Role=${user.role}`);
  } catch (err) {
    console.error('❌ Error creating test user:', err);
  } finally {
    await db.$disconnect();
  }
}

seedTestUser();
