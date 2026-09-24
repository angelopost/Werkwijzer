"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleEmployeeActive } from "@/actions/stylrs/employees";

type EmployeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  function: string | null;
  color: string;
  active: boolean;
};

export function EmployeeTable({ employees }: { employees: EmployeeRow[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>Functie</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <Link href={`/stylrs/medewerkers/${employee.id}`} className="flex items-center gap-2.5 hover:underline">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: employee.color }} />
                  {employee.firstName} {employee.lastName}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{employee.function ?? "—"}</TableCell>
              <TableCell>
                {employee.active ? <Badge>Actief</Badge> : <Badge variant="secondary">Inactief</Badge>}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/stylrs/medewerkers/${employee.id}`} />}
                >
                  Beheren
                </Button>
                <form action={toggleEmployeeActive.bind(null, employee.id)}>
                  <Button variant="outline" size="sm" type="submit">
                    {employee.active ? "Deactiveren" : "Activeren"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Nog geen medewerkers toegevoegd.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
