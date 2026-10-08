import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateWithYear, getAmsterdamToday } from "@/lib/dates";
import { WorkshopAddDialog } from "@/components/workshops/workshop-add-dialog";

type WorkshopRow = { id: string; name: string; date: Date };

function WorkshopList({ rows }: { rows: WorkshopRow[] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((workshop) => (
        <Link
          key={workshop.id}
          href={`/workshops/${workshop.id}`}
          className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
        >
          <span className="min-w-0 truncate font-medium">{workshop.name}</span>
          <span className="shrink-0 text-sm text-muted-foreground">
            {formatDateWithYear(workshop.date)}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default async function WorkshopsPage() {
  const today = getAmsterdamToday();
  const workshops = await prisma.workshop.findMany({
    select: { id: true, name: true, date: true },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const upcoming = workshops.filter((w) => w.date >= today);
  const past = workshops.filter((w) => w.date < today).reverse();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <WorkshopAddDialog />

      {workshops.length === 0 && (
        <p className="text-sm text-muted-foreground">Er zijn nog geen workshops toegevoegd.</p>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Aankomend</h2>
          <WorkshopList rows={upcoming} />
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Afgelopen</h2>
          <WorkshopList rows={past} />
        </section>
      )}
    </div>
  );
}
