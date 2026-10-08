"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckIcon, Plus, Repeat } from "lucide-react";
import { formatDayLabel, getWeekdayFullLabel, isToday, parseDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toggleTodoCompleted } from "@/app/(admin)/todo/actions";
import { TodoDialog } from "./todo-dialog";
import { PRIORITY_LABEL, type TodoItem, type TodoPriority, type TodoStaffOption } from "./types";

const PRIORITY_BADGE_VARIANT: Record<TodoPriority, "destructive" | "default" | "secondary"> = {
  DRINGEND: "destructive",
  NORMAAL: "default",
  NIET_DRINGEND: "secondary",
};

/** Kaartjes naast elkaar die automatisch doorlopen naar een volgende regel, zodat er nooit
 * zijwaarts gescrold hoeft te worden. */
const CARD_GRID = "grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]";

function TodoCard({
  todo,
  onClick,
  onToggle,
}: {
  todo: TodoItem;
  onClick: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-start gap-2 rounded-lg border bg-background p-2.5 shadow-sm transition-transform hover:-translate-y-px"
    >
      <Checkbox
        checked={todo.completed}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={cn(
            "flex items-center gap-1 text-sm font-medium break-words",
            todo.completed && "text-muted-foreground line-through"
          )}
        >
          {(todo.permanentTodoId || todo.permanentGeneral) && (
            <Repeat className="size-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
          )}
          {todo.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={PRIORITY_BADGE_VARIANT[todo.priority]}>{PRIORITY_LABEL[todo.priority]}</Badge>
          {todo.assigneeName && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <UserAvatar name={todo.assigneeName} className="size-4 text-[9px]" />
              {todo.assigneeName}
            </span>
          )}
        </div>
        {todo.completedByName && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CircleCheckIcon className="size-3" />
            Afgerond door {todo.completedByName}
          </span>
        )}
      </div>
    </div>
  );
}

export function TodoBoard({
  days: dayKeys,
  todos,
  staff,
  forStaff = false,
}: {
  days: string[];
  todos: TodoItem[];
  staff: TodoStaffOption[];
  forStaff?: boolean;
}) {
  const days = dayKeys.map(parseDateKey);

  const [selection, setSelection] = useState<{ dateKey: string | null; todo: TodoItem | null } | null>(
    null
  );
  const router = useRouter();

  const todosByDay = new Map<string, TodoItem[]>();
  const generalTodos: TodoItem[] = [];
  for (const todo of todos) {
    if (todo.date === null) {
      generalTodos.push(todo);
      continue;
    }
    const list = todosByDay.get(todo.date) ?? [];
    list.push(todo);
    todosByDay.set(todo.date, list);
  }

  async function handleToggle(id: string) {
    await toggleTodoCompleted(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Weekplanning: elke dag is één rij met links de datum en rechts de to do's. */}
      <section className="flex flex-col overflow-hidden rounded-xl border bg-card">
        {days.map((day, index) => {
          const dateKey = dayKeys[index];
          const dayTodos = todosByDay.get(dateKey) ?? [];
          const today = isToday(day);
          const doneCount = dayTodos.filter((t) => t.completed).length;
          return (
            <div
              key={dateKey}
              className={cn(
                "flex flex-col gap-3 border-b p-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-4",
                today && "bg-primary/5"
              )}
            >
              <div className="flex shrink-0 items-center gap-3 sm:w-44">
                <div
                  className={cn(
                    "flex size-11 shrink-0 flex-col items-center justify-center rounded-xl",
                    today ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}
                >
                  <span className="text-[10px] leading-none font-semibold uppercase">
                    {formatDayLabel(day).split(" ")[0]}
                  </span>
                  <span className="text-lg leading-tight font-bold">{day.getUTCDate()}</span>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold">
                    {today ? "Vandaag" : getWeekdayFullLabel(day)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dayTodos.length === 0
                      ? "Geen to do's"
                      : `${doneCount} van ${dayTodos.length} klaar`}
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className={CARD_GRID}>
                  {dayTodos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onClick={() => setSelection({ dateKey, todo })}
                      onToggle={() => handleToggle(todo.id)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelection({ dateKey, todo: null })}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                      dayTodos.length === 0 ? "min-h-10" : "min-h-14"
                    )}
                  >
                    <Plus className="size-4" strokeWidth={2} />
                    To do toevoegen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">Algemene to do&apos;s</h2>
            <p className="text-xs text-muted-foreground">
              Zonder vaste datum — kan gedaan worden wanneer het uitkomt.
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setSelection({ dateKey: null, todo: null })}>
            <Plus data-icon="inline-start" />
            Algemene to do toevoegen
          </Button>
        </div>
        <div className="rounded-xl border bg-card p-2.5">
          {generalTodos.length === 0 ? (
            <p className="p-1 text-xs text-muted-foreground">Geen algemene to do&apos;s</p>
          ) : (
            <div className={CARD_GRID}>
              {generalTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onClick={() => setSelection({ dateKey: null, todo })}
                  onToggle={() => handleToggle(todo.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selection && (
        <TodoDialog
          open
          onOpenChange={(open) => !open && setSelection(null)}
          dateKey={selection.dateKey}
          todo={selection.todo}
          staff={staff}
          forStaff={forStaff}
        />
      )}
    </div>
  );
}
