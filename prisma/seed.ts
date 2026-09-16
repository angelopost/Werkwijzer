import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "beheerder@werkwijzer.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "wijzigmij123";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Beheerder",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Beheerder-account klaar: ${admin.email} (wachtwoord: ${password})`);

  const staffPassword = await bcrypt.hash("wijzigmij123", 10);
  const staffData = [
    { name: "Sanne de Vries", email: "sanne@werkwijzer.local" },
    { name: "Milan Bakker", email: "milan@werkwijzer.local" },
    { name: "Femke Jansen", email: "femke@werkwijzer.local" },
    { name: "Daan Visser", email: "daan@werkwijzer.local" },
  ];

  for (const s of staffData) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash: staffPassword,
        role: "STAFF",
        contractHoursPerWeek: 24,
      },
    });
  }

  console.log(`${staffData.length} testmedewerkers klaar (wachtwoord: wijzigmij123)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
