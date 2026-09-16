import { prisma } from "@/lib/db";
import { StaffTable } from "@/components/medewerkers/staff-table";
import { AddStaffDialog } from "@/components/medewerkers/add-staff-dialog";

export default async function MedewerkersPage() {
  const staff = await prisma.user.findMany({
    where: { role: "STAFF" },
    orderBy: { name: "asc" },
    include: { invite: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <AddStaffDialog />
      </div>

      <StaffTable
        staff={staff.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          isActive: s.isActive,
          contractHoursPerWeek: s.contractHoursPerWeek,
          contractType: s.contractType,
          hasAcceptedInvite: !s.invite || s.invite.acceptedAt !== null,
        }))}
      />
    </div>
  );
}
