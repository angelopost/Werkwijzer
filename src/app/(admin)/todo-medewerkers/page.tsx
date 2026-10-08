import { redirect } from "next/navigation";

/** De to do's voor medewerkers staan nu samen met de andere to do's op /todo. */
export default function TodoMedewerkersPage() {
  redirect("/todo");
}
