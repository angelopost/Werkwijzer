"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckIcon, Repeat } from "lucide-react";
import { formatDayLabel, isToday, parseDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { markTodoCompletedBy } from "@/app/(staff)/mijn-to-do/actions";
import { StaffTodoDialog } from "./staff-todo-dialog";
import { PRIORITY_LABEL, type TodoItem, type TodoPriority, type TodoStaffOption } from "./types";

const PRIORITY_BADGE_VARIANT: Record<TodoPriority, "destructive" | "default" | "secondary"> = {
  DRINGEND: "destructive",
  NORMAAL: "default",
  NIET_DRINGEND: "secondary",
};

/** Afgeronde to do's zakken naar onderen, zodat ze niet in de weg staan.
 * Array.sort is stabiel, dus de volgorde binnen elke groep blijft behouden. */
function sortWithCompletedLast(list: TodoItem[]): TodoItem[] {
  return [...list].sort((a, b) => Number(a.completed) - Number(b.completed));
}

function StaffTodoCard({
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
          {!todo.completed && (
            <Badge variant={PRIORITY_BADGE_VARIANT[todo.priority]}>{PRIORITY_LABEL[todo.priority]}</Badge>
          )}
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

export function StaffTodoBoard({
  days: dayKeys,
  todos,
  staff,
  currentUserId,
}: {
  days: string[];
  todos: TodoItem[];
  staff: TodoStaffOption[];
  currentUserId: string;
}) {
  const days = dayKeys.map(parseDateKey);
  const [selected, setSelected] = useState<TodoItem | null>(null);
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

  async function handleToggle(todo: TodoItem) {
    await markTodoCompletedBy(todo.id, todo.completed ? null : currentUserId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {days.map((day, index) => {
          const dateKey = dayKeys[index];
          const dayTodos = sortWithCompletedLast(todosByDay.get(dateKey) ?? []);
          const label = isToday(day) ? "Vandaag" : formatDayLabel(day);
          return (
            <div key={dateKey} className="flex w-64 shrink-0 flex-col rounded-xl border bg-card">
              <div className="border-b p-3">
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2.5">
                {dayTodos.map((todo) => (
                  <StaffTodoCard
                    key={todo.id}
                    todo={todo}
                    onClick={() => setSelected(todo)}
                    onToggle={() => handleToggle(todo)}
                  />
                ))}
                {dayTodos.length === 0 && (
                  <p className="p-1 text-xs text-muted-foreground">Geen to do&apos;s</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Algemene to do&apos;s</h2>
        <p className="text-xs text-muted-foreground">
          Zonder vaste datum — kan gedaan worden wanneer het uitkomt.
        </p>
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-2.5">
          {sortWithCompletedLast(generalTodos).map((todo) => (
            <StaffTodoCard
              key={todo.id}
              todo={todo}
              onClick={() => setSelected(todo)}
              onToggle={() => handleToggle(todo)}
            />
          ))}
          {generalTodos.length === 0 && (
            <p className="p-1 text-xs text-muted-foreground">Geen algemene to do&apos;s</p>
          )}
        </div>
      </div>

      {selected && (
        <StaffTodoDialog
          open
          onOpenChange={(open) => !open && setSelected(null)}
          todo={selected}
          staff={staff}
        />
      )}
    </div>
  );
}
