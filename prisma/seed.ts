/**
 * Adds seed data to your db
 *
 * @see https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  await prisma.journalClub.create({
    data: {
      name: 'The Quantum Mechanics Journal Club',
      description: 'A weekly journal club on the latest in quantum mechanics.',
      lat: 51.505,
      lng: -0.09,
      frequency: 'weekly',
      time: 'Tuesdays at 2pm',
      creatorId: user.id,
    },
  });

  await prisma.journalClub.create({
    data: {
      name: 'The AI Ethics Journal Club',
      description: 'A monthly journal club on the ethics of artificial intelligence.',
      lat: 51.515,
      lng: -0.09,
      frequency: 'monthly',
      time: 'First Friday of the month at 4pm',
      creatorId: user.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
