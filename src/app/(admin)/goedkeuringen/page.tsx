import { redirect } from "next/navigation";

/** Goedkeuringen staan nu bovenaan de Uren-pagina; oude links sturen we daarheen door. */
export default function GoedkeuringenPage() {
  redirect("/uren");
}
