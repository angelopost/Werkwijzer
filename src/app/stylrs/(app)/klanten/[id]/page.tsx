import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSalonUser } from "@/lib/stylrs/permissions";
import { getCustomerStats } from "@/lib/stylrs/queries/customer";
import { PageHeader } from "@/components/stylrs/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CustomerProfileForm } from "@/components/stylrs/klanten/customer-profile-form";
import { CustomerNotes } from "@/components/stylrs/klanten/customer-notes";
import { formatCurrency, formatDateLong } from "@/lib/stylrs/format";
import { CalendarClock, Repeat, Heart, UserCheck } from "lucide-react";
import { StatCard } from "@/components/stylrs/stat-card";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSalonUser();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });

  if (!customer || customer.salonId !== user.salonId) {
    notFound();
  }

  const stats = await getCustomerStats(customer.id);

  return (
    <div>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={[customer.email, customer.phone].filter(Boolean).join(" · ") || undefined}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Bezoeken" value={stats.visitCount} icon={Repeat} />
        <StatCard
          label="Eerste afspraak"
          value={stats.firstVisit ? formatDateLong(stats.firstVisit) : "—"}
          icon={CalendarClock}
        />
        <StatCard label="Favoriete behandeling" value={stats.favoriteService ?? "—"} icon={Heart} />
        <StatCard label="Voorkeursmedewerker" value={stats.preferredEmployee ?? "—"} icon={UserCheck} />
      </div>

      <Tabs defaultValue="profiel" className="mt-6">
        <TabsList>
          <TabsTrigger value="profiel">Profiel</TabsTrigger>
          <TabsTrigger value="geschiedenis">Geschiedenis</TabsTrigger>
          <TabsTrigger value="notities">Notities</TabsTrigger>
        </TabsList>
        <TabsContent value="profiel" className="mt-4">
          <CustomerProfileForm customer={customer} canDelete={user.salonRole === "OWNER"} />
        </TabsContent>
        <TabsContent value="geschiedenis" className="mt-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            {stats.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen afspraken.</p>
            ) : (
              <ul className="divide-y">
                {stats.appointments.map((appointment) => (
                  <li key={appointment.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{appointment.service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateLong(appointment.startTime)} · {appointment.employee.firstName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatCurrency(Number(appointment.price))}</span>
                      {appointment.status === "CANCELLED" && <Badge variant="secondary">Geannuleerd</Badge>}
                      {appointment.status === "NO_SHOW" && <Badge variant="secondary">No-show</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
        <TabsContent value="notities" className="mt-4">
          <CustomerNotes customerId={customer.id} notes={customer.notes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
