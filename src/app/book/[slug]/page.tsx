import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getPublicSalonData } from "@/lib/stylrs/queries/public";
import { BookingWizard } from "@/components/stylrs/booking/booking-wizard";

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getPublicSalonData(slug);

  if (!salon) notFound();

  const closedWeekdays = new Set(salon.openingHours.filter((h) => h.isClosed).map((h) => h.weekday));

  return (
    <div className="min-h-svh bg-muted/40 px-4 py-10">
      <div className="mx-auto mb-8 flex max-w-lg flex-col items-center gap-2 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{salon.name}</h1>
        <p className="text-sm text-muted-foreground">Plan hier eenvoudig je afspraak.</p>
      </div>

      <BookingWizard
        slug={salon.slug}
        salonName={salon.name}
        services={salon.services}
        employees={salon.employees}
        bookingSettings={salon.bookingSettings}
        closedWeekdays={closedWeekdays}
      />

      <p className="mt-10 text-center text-xs text-muted-foreground">Boeken via STYLRS</p>
    </div>
  );
}
