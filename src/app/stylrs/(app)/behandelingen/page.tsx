import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import { PageHeader } from "@/components/stylrs/page-header";
import { Button } from "@/components/ui/button";
import { ServiceFormDialog } from "@/components/stylrs/behandelingen/service-form-dialog";
import { ServiceTable } from "@/components/stylrs/behandelingen/service-table";

export default async function BehandelingenPage() {
  const user = await requireOwner();

  const [services, employees] = await Promise.all([
    prisma.service.findMany({
      where: { salonId: user.salonId },
      include: { employees: { select: { employeeId: true } } },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    prisma.employee.findMany({
      where: { salonId: user.salonId, active: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const rows = services.map((s) => ({
    ...s,
    price: Number(s.price),
    employeeIds: s.employees.map((e) => e.employeeId),
  }));

  return (
    <div>
      <PageHeader
        title="Behandelingen"
        description="Stel zelf in welke behandelingen jouw salon aanbiedt, met prijs en duur."
        action={
          <ServiceFormDialog
            employees={employees}
            trigger={<Button>+ Nieuwe behandeling</Button>}
          />
        }
      />
      <ServiceTable services={rows} employees={employees} />
    </div>
  );
}
