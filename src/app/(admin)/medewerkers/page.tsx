import { prisma } from "@/lib/db";
import { StaffTable } from "@/components/medewerkers/staff-table";
import { AddStaffDialog } from "@/components/medewerkers/add-staff-dialog";

export default async function MedewerkersPage() {
  const [staff, functies] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF" },
      orderBy: { name: "asc" },
      include: { functies: { include: { functie: true } }, invite: true },
    }),
    prisma.functie.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <AddStaffDialog functies={functies} />
      </div>

      <StaffTable
        staff={staff.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          isActive: s.isActive,
          contractHoursPerWeek: s.contractHoursPerWeek,
          contractType: s.contractType,
          functieNames: s.functies.map((f) => f.functie.name),
          hasAcceptedInvite: !s.invite || s.invite.acceptedAt !== null,
        }))}
      />
    </div>
  );
}
