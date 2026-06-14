import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

type PlatformHeaderProps = {
  leading?: ReactNode
  center?: ReactNode
  trailing?: ReactNode
  sticky?: boolean
  scrolled?: boolean
  className?: string
  contentClassName?: string
  style?: CSSProperties
}

export const PlatformHeader = ({
  leading,
  center,
  trailing,
  sticky = false,
  scrolled = true,
  className,
  contentClassName,
  style,
}: PlatformHeaderProps) => (
  <nav
    className={cn(
      "border-b backdrop-blur-[0.875rem] transition-[border-color] duration-200",
      sticky && "sticky top-0 z-50",
      scrolled ? "border-border" : "border-transparent",
      className
    )}
    style={{
      background: "color-mix(in srgb, var(--background) 84%, transparent)",
      ...style,
    }}
  >
    <div
      className={cn(
        "mx-auto flex h-[3.625rem] max-w-[70rem] items-center gap-2.5 px-4.5",
        contentClassName
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">{center}</div>
      {trailing}
    </div>
  </nav>
)
