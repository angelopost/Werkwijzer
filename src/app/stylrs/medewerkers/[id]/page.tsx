import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import { PageHeader } from "@/components/stylrs/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeProfileForm } from "@/components/stylrs/medewerkers/employee-profile-form";
import { AvailabilityEditor } from "@/components/stylrs/medewerkers/availability-editor";
import { TimeOffList } from "@/components/stylrs/medewerkers/time-off-list";
import { ServicesEditor } from "@/components/stylrs/medewerkers/services-editor";
import { StylrsAppShellGuard } from "@/components/stylrs/layout/app-shell-guard";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOwner();

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      availability: true,
      timeOff: { orderBy: { startDate: "desc" } },
      services: { select: { serviceId: true } },
    },
  });

  if (!employee || employee.salonId !== user.salonId) {
    notFound();
  }

  const services = await prisma.service.findMany({
    where: { salonId: user.salonId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <StylrsAppShellGuard>
    <div>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={employee.function ?? undefined}
      />

      <Tabs defaultValue="profiel">
        <TabsList>
          <TabsTrigger value="profiel">Profiel</TabsTrigger>
          <TabsTrigger value="werktijden">Werktijden</TabsTrigger>
          <TabsTrigger value="vrij">Vrije dagen</TabsTrigger>
          <TabsTrigger value="behandelingen">Behandelingen</TabsTrigger>
        </TabsList>
        <TabsContent value="profiel" className="mt-4">
          <EmployeeProfileForm employee={employee} />
        </TabsContent>
        <TabsContent value="werktijden" className="mt-4">
          <AvailabilityEditor employeeId={employee.id} availability={employee.availability} />
        </TabsContent>
        <TabsContent value="vrij" className="mt-4">
          <TimeOffList employeeId={employee.id} timeOff={employee.timeOff} />
        </TabsContent>
        <TabsContent value="behandelingen" className="mt-4">
          <ServicesEditor
            employeeId={employee.id}
            services={services}
            selectedIds={employee.services.map((s) => s.serviceId)}
          />
        </TabsContent>
      </Tabs>
    </div>
    </StylrsAppShellGuard>
  );
}
