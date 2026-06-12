import { cn } from "@/lib/utils"

type GameMetaListProps = {
  items: Array<string>
  tone?: "default" | "featured"
}

export const GameMetaList = ({
  items,
  tone = "default",
}: GameMetaListProps) => (
  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
    {items.map((item) => (
      <span
        key={item}
        className={cn(
          "rounded-full border px-2.5 py-1 font-mono text-[0.625rem] font-medium tracking-[0.03em]",
          tone === "featured"
            ? "border-white/[16%] bg-white/[12%] text-background"
            : "border-border bg-muted text-muted-foreground"
        )}
      >
        {item}
      </span>
    ))}
  </div>
)
