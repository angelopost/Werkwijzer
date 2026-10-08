"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, CircleCheckIcon, ListTodo, Plus, Repeat } from "lucide-react";
import { addUTCDays, formatDayLabel, parseDateKey, toDateKey } from "@/lib/dates";
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

/** Aantal to do's dat onder elkaar staat voordat de lijst een kolom naar rechts doorloopt. */
const ROWS_PER_COLUMN = 3;

/** Kolommen naast elkaar; passen er niet meer, dan loopt het door op een nieuwe regel eronder
 * (zo hoeft er nooit zijwaarts gescrold te worden). */
const COLUMN_GRID = "grid items-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(16rem,1fr))]";

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function dateLabel(dateKey: string, todayKey: string): { label: string; highlight: boolean } {
  if (dateKey === todayKey) return { label: "Vandaag", highlight: true };
  const tomorrowKey = toDateKey(addUTCDays(parseDateKey(todayKey), 1));
  const formatted = formatDayLabel(parseDateKey(dateKey));
  if (dateKey === tomorrowKey) return { label: `Morgen · ${formatted}`, highlight: false };
  return { label: formatted, highlight: false };
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: typeof CalendarClock;
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <div className="flex flex-col">
          <h2 className="text-lg leading-tight font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function TodoCard({
  todo,
  dateChip,
  onClick,
  onToggle,
}: {
  todo: TodoItem;
  dateChip?: { label: string; highlight: boolean };
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
        {dateChip && (
          <span
            className={cn(
              "text-[11px] leading-none font-semibold tracking-wide uppercase",
              dateChip.highlight ? "text-primary" : "text-muted-foreground"
            )}
          >
            {dateChip.label}
          </span>
        )}
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
  todos,
  staff,
  forStaff = false,
  todayKey,
  basePath,
  weeks,
  moreWeeks,
}: {
  todos: TodoItem[];
  staff: TodoStaffOption[];
  forStaff?: boolean;
  todayKey: string;
  basePath: string;
  weeks: number;
  moreWeeks: number;
}) {
  const [selection, setSelection] = useState<{ dateKey: string | null; todo: TodoItem | null } | null>(
    null
  );
  const router = useRouter();

  // De query levert al op datum (oudste eerst), dan prioriteit; hier alleen splitsen.
  const datedTodos = todos.filter((todo) => todo.date !== null);
  const generalTodos = todos.filter((todo) => todo.date === null);
  const datedColumns = chunk(datedTodos, ROWS_PER_COLUMN);

  async function handleToggle(id: string) {
    await toggleTodoCompleted(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <SectionTitle
          icon={CalendarClock}
          title="To do's met datum"
          subtitle="Op volgorde van datum: de eerstvolgende staat bovenaan."
          action={
            <Button type="button" onClick={() => setSelection({ dateKey: todayKey, todo: null })}>
              <Plus data-icon="inline-start" />
              To do met datum toevoegen
            </Button>
          }
        />

        {datedColumns.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Geen to do&apos;s met datum in de komende {weeks} weken.
          </div>
        ) : (
          <div className={COLUMN_GRID}>
            {datedColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-2">
                {column.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    dateChip={dateLabel(todo.date!, todayKey)}
                    onClick={() => setSelection({ dateKey: todo.date, todo })}
                    onToggle={() => handleToggle(todo.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Je ziet de komende {weeks} weken.{" "}
          <Link href={`${basePath}?weken=${moreWeeks}`} className="font-medium text-primary hover:underline">
            Toon verder vooruit
          </Link>
          {weeks > 2 && (
            <>
              {" · "}
              <Link href={basePath} className="font-medium text-primary hover:underline">
                Terug naar 2 weken
              </Link>
            </>
          )}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle
          icon={ListTodo}
          title="Algemene to do's"
          subtitle="Zonder vaste datum — kan gedaan worden wanneer het uitkomt."
          action={
            <Button type="button" onClick={() => setSelection({ dateKey: null, todo: null })}>
              <Plus data-icon="inline-start" />
              Algemene to do toevoegen
            </Button>
          }
        />

        {generalTodos.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Geen algemene to do&apos;s
          </div>
        ) : (
          <div className={COLUMN_GRID}>
            {chunk(generalTodos, ROWS_PER_COLUMN).map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-2">
                {column.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onClick={() => setSelection({ dateKey: null, todo })}
                    onToggle={() => handleToggle(todo.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
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
