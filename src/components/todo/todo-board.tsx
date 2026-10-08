"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckIcon, Plus, Repeat } from "lucide-react";
import { formatDayLabel, isToday, parseDateKey } from "@/lib/dates";
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

type VisibilityFilter = "alle" | "beheerders" | "medewerkers";

const FILTER_OPTIONS: { value: VisibilityFilter; label: string }[] = [
  { value: "alle", label: "Alles" },
  { value: "beheerders", label: "Alleen beheerders" },
  { value: "medewerkers", label: "Voor medewerkers" },
];

/** Kleine label op elke kaart, zodat in één oogopslag te zien is voor wie de to do is. */
function VisibilityChip({ forStaff }: { forStaff: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded px-1.5 py-px text-[10px] leading-4 font-medium whitespace-nowrap",
        forStaff ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}
    >
      {forStaff ? "Medewerkers" : "Beheerders"}
    </span>
  );
}

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
          <VisibilityChip forStaff={todo.forStaff} />
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

function GeneralList({
  title,
  todos,
  emptyLabel,
  onAdd,
  onSelect,
  onToggle,
}: {
  title: string;
  todos: TodoItem[];
  emptyLabel: string;
  onAdd: () => void;
  onSelect: (todo: TodoItem) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" size="sm" onClick={onAdd}>
          <Plus data-icon="inline-start" />
          Toevoegen
        </Button>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-2.5">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onClick={() => onSelect(todo)}
            onToggle={() => onToggle(todo.id)}
          />
        ))}
        {todos.length === 0 && <p className="p-1 text-xs text-muted-foreground">{emptyLabel}</p>}
      </div>
    </div>
  );
}

export function TodoBoard({
  days: dayKeys,
  todos,
  staff,
}: {
  days: string[];
  todos: TodoItem[];
  staff: TodoStaffOption[];
}) {
  const days = dayKeys.map(parseDateKey);
  const defaultDateKey = dayKeys[0];

  const [selection, setSelection] = useState<{
    dateKey: string | null;
    todo: TodoItem | null;
    forStaff: boolean;
  } | null>(null);
  const [filter, setFilter] = useState<VisibilityFilter>("alle");
  const router = useRouter();

  const visibleTodos = todos.filter(
    (todo) =>
      filter === "alle" ||
      (filter === "medewerkers" && todo.forStaff) ||
      (filter === "beheerders" && !todo.forStaff)
  );

  const todosByDay = new Map<string, TodoItem[]>();
  const generalAdminTodos: TodoItem[] = [];
  const generalStaffTodos: TodoItem[] = [];
  for (const todo of visibleTodos) {
    if (todo.date === null) {
      (todo.forStaff ? generalStaffTodos : generalAdminTodos).push(todo);
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

  const showAdminGeneral = filter !== "medewerkers";
  const showStaffGeneral = filter !== "beheerders";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setSelection({ dateKey: defaultDateKey, todo: null, forStaff: false })}
        >
          <Plus data-icon="inline-start" />
          To do toevoegen
        </Button>

        <div
          role="radiogroup"
          aria-label="Zichtbaarheid"
          className="inline-flex items-center gap-1 rounded-lg border bg-card p-1"
        >
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alle dagen passen naast/onder elkaar zonder zijwaarts scrollen: 7 kolommen op een
          breed scherm, 4 op een laptop, 2 op een tablet en 1 op een telefoon. */}
      <div
        className={cn(
          "grid gap-3",
          days.length === 1
            ? "max-w-xl"
            : "sm:grid-cols-2 lg:grid-cols-4 min-[103rem]:grid-cols-7"
        )}
      >
        {days.map((day, index) => {
          const dateKey = dayKeys[index];
          const dayTodos = todosByDay.get(dateKey) ?? [];
          const label = isToday(day) ? "Vandaag" : formatDayLabel(day);
          return (
            <div key={dateKey} className="flex min-w-0 flex-col rounded-xl border bg-card">
              <div className="border-b p-3">
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2.5">
                {dayTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onClick={() => setSelection({ dateKey, todo, forStaff: todo.forStaff })}
                    onToggle={() => handleToggle(todo.id)}
                  />
                ))}
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
        <div className={cn("grid gap-4", showAdminGeneral && showStaffGeneral && "lg:grid-cols-2")}>
          {showAdminGeneral && (
            <GeneralList
              title="Alleen beheerders"
              todos={generalAdminTodos}
              emptyLabel="Geen algemene to do's"
              onAdd={() => setSelection({ dateKey: null, todo: null, forStaff: false })}
              onSelect={(todo) => setSelection({ dateKey: null, todo, forStaff: false })}
              onToggle={handleToggle}
            />
          )}
          {showStaffGeneral && (
            <GeneralList
              title="Voor medewerkers"
              todos={generalStaffTodos}
              emptyLabel="Geen algemene to do's"
              onAdd={() => setSelection({ dateKey: null, todo: null, forStaff: true })}
              onSelect={(todo) => setSelection({ dateKey: null, todo, forStaff: true })}
              onToggle={handleToggle}
            />
          )}
        </div>
      </div>

      {selection && (
        <TodoDialog
          open
          onOpenChange={(open) => !open && setSelection(null)}
          dateKey={selection.dateKey}
          todo={selection.todo}
          staff={staff}
          defaultForStaff={selection.forStaff}
        />
      )}
    </div>
  );
}
