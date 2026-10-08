import { TodoPageContent } from "@/components/todo/todo-page";

export default async function TodoMedewerkersPage({
  searchParams,
}: {
  searchParams: Promise<{ weken?: string }>;
}) {
  const params = await searchParams;
  return <TodoPageContent forStaff basePath="/todo-medewerkers" weeksParam={params.weken} />;
}
