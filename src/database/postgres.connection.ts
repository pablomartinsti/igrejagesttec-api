import { prisma } from './prisma.client';

export async function setupPostgres(): Promise<void> {
  try {
    console.log('🎲 Connecting to DB...');

    await prisma.$connect();

    console.log('✅ DB Connected!');
  } catch (error) {
    console.error('❌ DB not Connected. Error:', error);
    throw new Error('❌ DB not Connected.');
  }
}
