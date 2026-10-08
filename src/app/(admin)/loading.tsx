export default function Loading() {
  // Verschijnt direct bij het openen van een pagina, terwijl de gegevens nog binnenkomen.
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="Laden">
      <div className="h-9 w-64 rounded-lg bg-muted" />
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
