import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateWithYear, getAmsterdamToday, toDateKey } from "@/lib/dates";
import { WorkshopDetail } from "@/components/workshops/workshop-detail";

export default async function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: { actions: { orderBy: [{ date: "asc" }, { createdAt: "asc" }] } },
  });
  if (!workshop) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/workshops"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Alle workshops
      </Link>

      <WorkshopDetail
        todayKey={toDateKey(getAmsterdamToday())}
        workshop={{
          id: workshop.id,
          name: workshop.name,
          dateKey: toDateKey(workshop.date),
          dateLabel: formatDateWithYear(workshop.date),
          notes: workshop.notes,
          paymentLinkSent: workshop.paymentLinkSent,
          paid: workshop.paid,
          status: workshop.status,
          updatedAt: workshop.updatedAt.toISOString(),
          actions: workshop.actions.map((a) => ({
            id: a.id,
            dateKey: toDateKey(a.date),
            dateLabel: formatDateWithYear(a.date),
            description: a.description,
          })),
        }}
      />
    </div>
  );
}
