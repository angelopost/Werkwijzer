import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StylrsAuthShell } from "@/components/stylrs/auth-shell";
import { RegisterForm } from "./register-form";

export default function StylrsRegisterPage() {
  return (
    <StylrsAuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Salon aanmaken</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Al een account?{" "}
            <Link href="/stylrs/login" className="font-medium text-primary hover:underline">
              Inloggen
            </Link>
          </p>
        </CardContent>
      </Card>
    </StylrsAuthShell>
  );
}
