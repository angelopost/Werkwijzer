import { TodoPageContent } from "@/components/todo/todo-page";

export default async function TodoPage({
  searchParams,
}: {
  searchParams: Promise<{ weken?: string }>;
}) {
  const params = await searchParams;
  return <TodoPageContent forStaff={false} basePath="/todo" weeksParam={params.weken} />;
}
