import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function StylrsLoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Inloggen bij STYLRS</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Nog geen salonaccount?{" "}
          <Link href="/stylrs/registreren" className="font-medium text-primary hover:underline">
            Salon aanmaken
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
