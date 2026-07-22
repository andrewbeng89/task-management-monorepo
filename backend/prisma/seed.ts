import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 requires a driver adapter; the connection string comes from the env.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default skills
  const frontendSkill = await prisma.skill.upsert({
    where: { name: 'Frontend' },
    update: {},
    create: { name: 'Frontend' },
  });

  const backendSkill = await prisma.skill.upsert({
    where: { name: 'Backend' },
    update: {},
    create: { name: 'Backend' },
  });

  // Create Developers with Skill mappings (Part 1.2)
  const developers = [
    { name: 'Alice', skills: [frontendSkill.id] },
    { name: 'Bob', skills: [backendSkill.id] },
    { name: 'Carol', skills: [frontendSkill.id, backendSkill.id] },
    { name: 'Dave', skills: [backendSkill.id] },
  ];

  for (const dev of developers) {
    await prisma.developer.upsert({
      where: { name: dev.name },
      update: {},
      create: {
        name: dev.name,
        skills: {
          create: dev.skills.map((skillId) => ({ skillId })),
        },
      },
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
