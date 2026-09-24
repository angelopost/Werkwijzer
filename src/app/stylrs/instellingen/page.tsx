import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import { PageHeader } from "@/components/stylrs/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingLinkCard } from "@/components/stylrs/instellingen/booking-link-card";
import { SalonInfoForm } from "@/components/stylrs/instellingen/salon-info-form";
import { OpeningHoursForm } from "@/components/stylrs/instellingen/opening-hours-form";
import { BookingSettingsForm } from "@/components/stylrs/instellingen/booking-settings-form";
import { StylrsAppShellGuard } from "@/components/stylrs/layout/app-shell-guard";

export default async function InstellingenPage() {
  const user = await requireOwner();

  const salon = await prisma.salon.findUniqueOrThrow({
    where: { id: user.salonId },
    include: { openingHours: true, bookingSettings: true },
  });

  return (
    <StylrsAppShellGuard>
    <div>
      <PageHeader title="Instellingen" description="Beheer je salongegevens, openingstijden en boekingsregels." />

      <div className="mb-6">
        <BookingLinkCard slug={salon.slug} />
      </div>

      <Tabs defaultValue="bedrijfsgegevens">
        <TabsList>
          <TabsTrigger value="bedrijfsgegevens">Bedrijfsgegevens</TabsTrigger>
          <TabsTrigger value="openingstijden">Openingstijden</TabsTrigger>
          <TabsTrigger value="boeken">Boekingsinstellingen</TabsTrigger>
        </TabsList>
        <TabsContent value="bedrijfsgegevens" className="mt-4">
          <SalonInfoForm salon={salon} />
        </TabsContent>
        <TabsContent value="openingstijden" className="mt-4">
          <OpeningHoursForm days={salon.openingHours} />
        </TabsContent>
        <TabsContent value="boeken" className="mt-4">
          {salon.bookingSettings && <BookingSettingsForm settings={salon.bookingSettings} />}
        </TabsContent>
      </Tabs>
    </div>
    </StylrsAppShellGuard>
  );
}
