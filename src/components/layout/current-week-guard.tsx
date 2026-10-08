"use client";

import { useEffect } from "react";
import { getAmsterdamDateKey, getAmsterdamToday, getWeekStart, toDateKey } from "@/lib/dates";

/** Zorgt dat het rooster altijd op de huidige week opent:
 * - Is de pagina geladen met een oudere/andere week in de link (bv. een bewaarde link of een
 *   oud tabblad dat door de telefoon wordt hersteld), dan gaat hij bij het eerste bezoek in
 *   deze sessie automatisch naar de huidige week.
 * - Is er sinds het laden een nieuwe dag begonnen (tabblad bleef open of komt uit het
 *   geheugen terug), dan laadt hij opnieuw op de huidige week.
 * Binnen een sessie kun je gewoon met de pijltjes door de weken bladeren. */
export function CurrentWeekGuard({
  basePath,
  weekKey,
  todayKey,
  explicitWeek,
}: {
  basePath: string;
  weekKey: string;
  todayKey: string;
  explicitWeek: boolean;
}) {
  useEffect(() => {
    const storageKey = `werkwijzer-week-bezocht:${basePath}`;
    let alreadyVisited = false;
    try {
      alreadyVisited = sessionStorage.getItem(storageKey) === "1";
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Geen sessionStorage beschikbaar (bv. privévenster): dan slaan we deze controle over.
      alreadyVisited = true;
    }

    const currentWeekKey = toDateKey(getWeekStart(getAmsterdamToday()));
    if (!alreadyVisited && explicitWeek && weekKey !== currentWeekKey) {
      window.location.replace(basePath);
      return;
    }

    function reloadIfNewDay() {
      if (getAmsterdamDateKey(new Date()) !== todayKey) {
        window.location.replace(basePath);
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") reloadIfNewDay();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", reloadIfNewDay);
    window.addEventListener("pageshow", reloadIfNewDay);
    const interval = window.setInterval(reloadIfNewDay, 60_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", reloadIfNewDay);
      window.removeEventListener("pageshow", reloadIfNewDay);
      window.clearInterval(interval);
    };
  }, [basePath, weekKey, todayKey, explicitWeek]);

  return null;
}
