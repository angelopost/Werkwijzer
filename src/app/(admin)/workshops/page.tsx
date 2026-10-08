import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateWithYear, getAmsterdamToday, getMonthShort } from "@/lib/dates";
import { WorkshopAddDialog } from "@/components/workshops/workshop-add-dialog";
import { WorkshopStatusBadges } from "@/components/workshops/status-badges";
import type { WorkshopStatus } from "@/components/workshops/types";

type WorkshopRow = {
  id: string;
  name: string;
  date: Date;
  status: WorkshopStatus;
  paymentLinkSent: boolean;
  paid: boolean;
};

function WorkshopList({ rows }: { rows: WorkshopRow[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((workshop) => (
        <Link
          key={workshop.id}
          href={`/workshops/${workshop.id}`}
          className="group flex items-center gap-4 rounded-2xl border bg-card p-3.5 shadow-xs transition-all hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {getMonthShort(workshop.date)}
            </span>
            <span className="text-xl leading-none font-bold">{workshop.date.getUTCDate()}</span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-col">
              <span className="truncate font-semibold">{workshop.name}</span>
              <span className="text-xs text-muted-foreground">{formatDateWithYear(workshop.date)}</span>
            </div>
            <WorkshopStatusBadges
              status={workshop.status}
              paymentLinkSent={workshop.paymentLinkSent}
              paid={workshop.paid}
            />
          </div>

          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{count}</span>
      </h2>
      {children}
    </section>
  );
}

export default async function WorkshopsPage() {
  const today = getAmsterdamToday();
  const workshops = await prisma.workshop.findMany({
    select: { id: true, name: true, date: true, status: true, paymentLinkSent: true, paid: true },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const upcoming = workshops.filter((w) => w.date >= today);
  const past = workshops.filter((w) => w.date < today).reverse();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <WorkshopAddDialog />

      {workshops.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Er zijn nog geen workshops toegevoegd.
        </div>
      )}

      {upcoming.length > 0 && (
        <Section title="Aankomend" count={upcoming.length}>
          <WorkshopList rows={upcoming} />
        </Section>
      )}

      {past.length > 0 && (
        <Section title="Afgelopen" count={past.length}>
          <WorkshopList rows={past} />
        </Section>
      )}
    </div>
  );
}
