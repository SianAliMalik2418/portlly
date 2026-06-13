export const EmptyState = () => (
  <div className="flex flex-col items-center px-5 py-9 text-center text-muted-foreground">
    <span className="mb-2.5 text-[2.5rem]">🌊</span>
    <p className="max-w-[30ch] text-sm">
      Guess the secret word. Every guess is scored 0–100 by how close it is in{" "}
      <b className="font-semibold text-foreground">meaning</b> — not letters. Warmer = closer.
    </p>
  </div>
)
