import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import { PageHeader } from "@/components/stylrs/page-header";
import { EmailSettingsForm } from "@/components/stylrs/instellingen/email-settings-form";
import { UserX } from "lucide-react";
import { StylrsAppShellGuard } from "@/components/stylrs/layout/app-shell-guard";

export default async function AutomatiseringenPage() {
  const user = await requireOwner();

  const emailSettings = await prisma.emailAutomationSettings.findUniqueOrThrow({
    where: { salonId: user.salonId },
  });

  return (
    <StylrsAppShellGuard>
    <div>
      <PageHeader
        title="Automatiseringen"
        description="Stel in welke automatische e-mails jouw salon verstuurt naar klanten."
      />

      <div className="flex flex-col gap-6">
        <EmailSettingsForm settings={emailSettings} />

        <div className="flex items-start gap-3 rounded-xl border border-dashed p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserX className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Klant terugwinnen</p>
            <p className="text-sm text-muted-foreground">
              Binnenkort: automatisch een e-mail sturen naar klanten die al een tijd niet zijn geweest.
            </p>
          </div>
        </div>
      </div>
    </div>
    </StylrsAppShellGuard>
  );
}
