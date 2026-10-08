import { prisma } from "@/lib/db";

/** Vaste kleurvolgorde per medewerker: de plek in de lijst van alle medewerkers (ook
 * niet-actieve) op volgorde van aanmaken. Daardoor behoudt iemand zijn kleur, ook als
 * er medewerkers inactief worden gezet, en hebben medewerkers onderling verschillende kleuren. */
export async function getStaffColorIndexes(): Promise<Map<string, number>> {
  const all = await prisma.user.findMany({
    where: { role: "STAFF" },
    select: { id: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return new Map(all.map((user, index) => [user.id, index]));
}
