import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSalonUser } from "@/lib/stylrs/permissions";
import { PageHeader } from "@/components/stylrs/page-header";
import { EmptyState } from "@/components/stylrs/empty-state";
import { AddCustomerDialog } from "@/components/stylrs/klanten/add-customer-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search } from "lucide-react";

export default async function KlantenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireSalonUser();
  const { q } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: {
      salonId: user.salonId,
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { lastName: "asc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Klanten"
        description="Het klantenbestand van jouw salon."
        action={<AddCustomerDialog />}
      />

      <form className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q ?? ""} placeholder="Zoek op naam, e-mail of telefoon…" className="pl-8" />
      </form>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "Geen klanten gevonden" : "Nog geen klanten"}
          description={
            q
              ? "Probeer een andere zoekterm."
              : "Klanten verschijnen hier zodra je ze toevoegt of zodra iemand online een afspraak boekt."
          }
        />
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <Link href={`/stylrs/klanten/${customer.id}`} className="hover:underline">
                      {customer.firstName} {customer.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/stylrs/klanten/${customer.id}`} />}
                    >
                      Bekijken
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
