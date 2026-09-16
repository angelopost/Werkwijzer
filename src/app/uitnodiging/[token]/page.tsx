import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetPasswordForm } from "./set-password-form";

export default async function UitnodigingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({ where: { token }, include: { user: true } });

  const invalid = !invite || invite.acceptedAt || invite.expiresAt < new Date();

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Welkom bij Werkwijzer</CardTitle>
        </CardHeader>
        <CardContent>
          {invalid ? (
            <p className="text-sm text-muted-foreground">
              Deze uitnodigingslink is ongeldig of verlopen. Vraag de beheerder om een nieuwe link.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Hoi {invite.user.name}, stel hieronder je wachtwoord in om je account te activeren.
              </p>
              <SetPasswordForm token={token} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
