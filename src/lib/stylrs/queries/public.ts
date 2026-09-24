import "server-only";
import { prisma } from "@/lib/db";

export async function getPublicSalonData(slug: string) {
  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: {
      bookingSettings: true,
      openingHours: true,
      services: {
        where: { active: true },
        include: { employees: { select: { employeeId: true } } },
        orderBy: { name: "asc" },
      },
      employees: {
        where: { active: true },
        orderBy: { firstName: "asc" },
      },
    },
  });

  if (!salon || !salon.bookingSettings) return null;

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    address: salon.address,
    postalCode: salon.postalCode,
    city: salon.city,
    phone: salon.phone,
    email: salon.email,
    bookingSettings: salon.bookingSettings,
    openingHours: salon.openingHours.map((h) => ({
      weekday: h.weekday,
      isClosed: h.isClosed,
    })),
    services: salon.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: Number(s.price),
      durationMinutes: s.durationMinutes,
      category: s.category,
      employeeIds: s.employees.map((e) => e.employeeId),
    })),
    employees: salon.employees.map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      color: e.color,
    })),
  };
}

export type PublicSalonData = NonNullable<Awaited<ReturnType<typeof getPublicSalonData>>>;
