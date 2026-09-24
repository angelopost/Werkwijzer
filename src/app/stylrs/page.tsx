import { redirect } from "next/navigation";
import { getOptionalSalonUser } from "@/lib/stylrs/permissions";

export default async function StylrsRootPage() {
  const user = await getOptionalSalonUser();
  redirect(user ? "/stylrs/dashboard" : "/stylrs/login");
}
