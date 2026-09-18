"use client";

import { useState } from "react";
import { CircleCheckIcon, Repeat } from "lucide-react";
import { formatDayLabel, isToday, parseDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StaffTodoDialog } from "./staff-todo-dialog";
import { PRIORITY_LABEL, type TodoItem, type TodoPriority, type TodoStaffOption } from "./types";

const PRIORITY_BADGE_VARIANT: Record<TodoPriority, "destructive" | "default" | "secondary"> = {
  DRINGEND: "destructive",
  NORMAAL: "default",
  NIET_DRINGEND: "secondary",
};

export function StaffTodoBoard({
  days: dayKeys,
  todos,
  staff,
}: {
  days: string[];
  todos: TodoItem[];
  staff: TodoStaffOption[];
}) {
  const days = dayKeys.map(parseDateKey);
  const [selected, setSelected] = useState<TodoItem | null>(null);

  const todosByDay = new Map<string, TodoItem[]>();
  for (const todo of todos) {
    const list = todosByDay.get(todo.date) ?? [];
    list.push(todo);
    todosByDay.set(todo.date, list);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {days.map((day, index) => {
          const dateKey = dayKeys[index];
          const dayTodos = todosByDay.get(dateKey) ?? [];
          const label = isToday(day) ? "Vandaag" : formatDayLabel(day);
          return (
            <div key={dateKey} className="flex w-64 shrink-0 flex-col rounded-xl border bg-card">
              <div className="border-b p-3">
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2.5">
                {dayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => setSelected(todo)}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border bg-background p-2.5 shadow-sm transition-transform hover:-translate-y-px"
                  >
                    <Checkbox checked={todo.completed} disabled className="mt-0.5" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium break-words",
                          todo.completed && "text-muted-foreground line-through"
                        )}
                      >
                        {todo.permanentTodoId && (
                          <Repeat className="size-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                        )}
                        {todo.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={PRIORITY_BADGE_VARIANT[todo.priority]}>
                          {PRIORITY_LABEL[todo.priority]}
                        </Badge>
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
                ))}
                {dayTodos.length === 0 && (
                  <p className="p-1 text-xs text-muted-foreground">Geen to do&apos;s</p>
                )}
              </div>
            </div>
          );
        })}
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
