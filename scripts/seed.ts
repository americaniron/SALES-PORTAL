import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../db/schema';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing in .env');
  throw new Error('DATABASE_URL is missing in .env');
}

const main = async () => {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  console.log('🌱 Seeding initial Admin user...');

  const email = 'admin@americanironus.com';
  const password = 'admin123'; // Change this for production
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  try {
    await db.insert(users).values({
      email,
      name: 'System Admin',
      role: 'admin',
      password_hash,
    }).onConflictDoNothing(); // Prevent error if running twice

    console.log(`✅ User created: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('⚠️  Please change this password immediately after logging in.');
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    await client.end();
  }
};

main();