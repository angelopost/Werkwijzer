import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import { PageHeader } from "@/components/stylrs/page-header";
import { AddEmployeeDialog } from "@/components/stylrs/medewerkers/add-employee-dialog";
import { EmployeeTable } from "@/components/stylrs/medewerkers/employee-table";

export default async function MedewerkersPage() {
  const user = await requireOwner();

  const employees = await prisma.employee.findMany({
    where: { salonId: user.salonId },
    orderBy: [{ active: "desc" }, { firstName: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Medewerkers"
        description="Beheer wie er in jouw salon werkt, hun werktijden en welke behandelingen ze uitvoeren."
        action={<AddEmployeeDialog />}
      />
      <EmployeeTable employees={employees} />
    </div>
  );
}
