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

  const functies = await Promise.all(
    [
      { name: "Bediening", color: "#2563eb" },
      { name: "Keuken", color: "#16a34a" },
      { name: "Bar", color: "#9333ea" },
    ].map((functie) =>
      prisma.functie.upsert({
        where: { name: functie.name },
        update: {},
        create: functie,
      })
    )
  );

  const staffPassword = await bcrypt.hash("wijzigmij123", 10);
  const staffData = [
    { name: "Sanne de Vries", email: "sanne@werkwijzer.local", functie: "Bediening" },
    { name: "Milan Bakker", email: "milan@werkwijzer.local", functie: "Keuken" },
    { name: "Femke Jansen", email: "femke@werkwijzer.local", functie: "Bar" },
    { name: "Daan Visser", email: "daan@werkwijzer.local", functie: "Bediening" },
  ];

  for (const s of staffData) {
    const functie = functies.find((f) => f.name === s.functie)!;
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash: staffPassword,
        role: "STAFF",
        contractHoursPerWeek: 24,
        functies: { create: [{ functieId: functie.id }] },
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
