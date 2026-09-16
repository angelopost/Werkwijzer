"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toggleStaffActive, regenerateInvite } from "@/app/(admin)/medewerkers/actions";
import { InviteLinkBanner } from "./invite-link-banner";
import { ContractTypeSelect } from "./contract-type-select";
import { ContractHoursInput } from "./contract-hours-input";

type StaffRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  contractHoursPerWeek: number | null;
  contractType: "VAST" | "NUL_UREN" | null;
  hasAcceptedInvite: boolean;
};

export function StaffTable({ staff }: { staff: StaffRow[] }) {
  const [invitePath, setInvitePath] = useState<string | null>(null);

  async function handleRegenerate(userId: string) {
    const result = await regenerateInvite(userId);
    if (result?.invitePath) setInvitePath(result.invitePath);
  }

  return (
    <div className="flex flex-col gap-4">
      {invitePath && <InviteLinkBanner path={invitePath} onDismiss={() => setInvitePath(null)} />}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Contracturen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={member.name} />
                    {member.name}
                    <ContractTypeSelect userId={member.id} value={member.contractType} />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell>
                  <ContractHoursInput userId={member.id} value={member.contractHoursPerWeek} />
                </TableCell>
                <TableCell>
                  {!member.hasAcceptedInvite ? (
                    <Badge variant="secondary">Uitnodiging openstaand</Badge>
                  ) : member.isActive ? (
                    <Badge>Actief</Badge>
                  ) : (
                    <Badge variant="secondary">Inactief</Badge>
                  )}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  {!member.hasAcceptedInvite && (
                    <Button variant="outline" size="sm" onClick={() => handleRegenerate(member.id)}>
                      Nieuwe link
                    </Button>
                  )}
                  <form action={toggleStaffActive.bind(null, member.id)}>
                    <Button variant="outline" size="sm" type="submit">
                      {member.isActive ? "Deactiveren" : "Activeren"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nog geen medewerkers toegevoegd.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
