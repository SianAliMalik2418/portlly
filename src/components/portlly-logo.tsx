import { cn } from "@/lib/utils"

type PortllyLogoProps = {
  className?: string
}

export const PortllyLogo = ({ className }: PortllyLogoProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-flex items-center gap-2.5 text-foreground",
      className
    )}
  >
    <svg
      className="h-9 w-9 shrink-0"
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="14" fill="var(--foreground)" />
      <path
        d="M14 36.1c-.7.2-1.2-.2-1.2-.9l-.6-21.8c0-1.2.8-2.2 2-2.3l10.9-.7c8.4-.5 14.6 4 14.7 11 .1 7.1-5.7 12-14.4 12h-3.8l.1 4.5c0 .7-.4 1.3-1.1 1.5L14 41.2v-5.1Zm7.4-9.5h4.2c4 0 6.7-2 6.7-5.1s-2.5-5-6.5-4.8l-4.7.3.3 9.6Z"
        fill="var(--primary)"
      />
      <path
        d="M21.1 17h4.7c4-.2 6.5 1.7 6.5 4.8s-2.7 5.1-6.7 5.1h-4.2L21.1 17Z"
        fill="var(--foreground)"
      />
      <path
        d="M25.4 19.4c.3-1.5.9-1.5 1.2 0 .2 1.1.9 1.8 2 2 1.5.3 1.5.9 0 1.2-1.1.2-1.8.9-2 2-.3 1.5-.9 1.5-1.2 0-.2-1.1-.9-1.8-2-2-1.5-.3-1.5-.9 0-1.2 1.1-.2 1.8-.9 2-2Z"
        fill="var(--primary)"
      />
    </svg>
    <span className="font-display text-[1.12rem] leading-none font-bold tracking-[-0.025em]">
      portl<span className="text-primary">yy</span>
    </span>
  </span>
)
