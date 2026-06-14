import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import type { ComponentProps } from "react"

type LoaderText = string | { text: string; className?: string }

type LoaderProps = ComponentProps<"div"> & {
  label?: string
  texts?: LoaderText[]
  iconClassName?: string
  textClassName?: string
  textContainerClassName?: string
  textIntervalMs?: number
}

const getTextValue = (item: LoaderText) =>
  typeof item === "string" ? item : item.text

const DEFAULT_TEXTS: LoaderText[] = ["Loading"]

function Loader({
  className,
  label,
  texts = DEFAULT_TEXTS,
  iconClassName,
  textClassName,
  textContainerClassName,
  textIntervalMs = 1400,
  ...props
}: LoaderProps) {
  const ariaLabel =
    label ?? (texts.length > 0 ? texts.map(getTextValue).join(". ") : "Loading")
  const [activeTextIndex, setActiveTextIndex] = useState(0)

  useEffect(() => {
    setActiveTextIndex(0)
  }, [texts])

  useEffect(() => {
    if (texts.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveTextIndex((index) => (index + 1) % texts.length)
    }, textIntervalMs)

    return () => window.clearInterval(interval)
  }, [textIntervalMs, texts.length])

  const activeText = texts[activeTextIndex]

  return (
    <div
      data-slot="loader"
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col items-center justify-center gap-5 text-center",
        className
      )}
      {...props}
    >
      <style>
        {`
            @keyframes loader-spin-pixel {
              0% { opacity: 0; }
              1% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes loader-text-shimmer {
              0% { background-position: 120% 0; }
              100% { background-position: -120% 0; }
            }
            @keyframes loader-text-in {
              from { opacity: 0; transform: translateY(0.25rem); }
              to { opacity: 1; transform: translateY(0); }
            }
            .loader-pixel-1 { animation: loader-spin-pixel 0.8s ease-in-out 0s infinite; }
            .loader-pixel-2 { animation: loader-spin-pixel 0.8s ease-in-out 0.1s infinite; }
            .loader-pixel-3 { animation: loader-spin-pixel 0.8s ease-in-out 0.2s infinite; }
            .loader-pixel-4 { animation: loader-spin-pixel 0.8s ease-in-out 0.3s infinite; }
            .loader-pixel-5 { animation: loader-spin-pixel 0.8s ease-in-out 0.4s infinite; }
            .loader-pixel-6 { animation: loader-spin-pixel 0.8s ease-in-out 0.5s infinite; }
            .loader-pixel-7 { animation: loader-spin-pixel 0.8s ease-in-out 0.6s infinite; }
            .loader-pixel-8 { animation: loader-spin-pixel 0.8s ease-in-out 0.7s infinite; }
            .loader-text-shimmer {
              background-image: linear-gradient(
                90deg,
                var(--muted-foreground) 0%,
                var(--foreground) 42%,
                var(--primary) 50%,
                var(--foreground) 58%,
                var(--muted-foreground) 100%
              );
              background-size: 220% 100%;
              background-clip: text;
              -webkit-background-clip: text;
              color: transparent;
              -webkit-text-fill-color: transparent;
              animation: loader-text-shimmer 2.4s ease-in-out infinite;
            }
            .loader-text-entry {
              animation: loader-text-in 220ms cubic-bezier(0.23, 1, 0.32, 1);
            }
          `}
      </style>

      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={cn("size-10 text-primary", iconClassName)}
      >
        <rect className="loader-pixel-1" x="8" y="0" width="4" height="4" />
        <rect className="loader-pixel-2" x="12" y="4" width="4" height="4" />
        <rect className="loader-pixel-3" x="16" y="8" width="4" height="4" />
        <rect className="loader-pixel-4" x="12" y="12" width="4" height="4" />
        <rect className="loader-pixel-5" x="8" y="16" width="4" height="4" />
        <rect className="loader-pixel-6" x="4" y="12" width="4" height="4" />
        <rect className="loader-pixel-7" x="0" y="8" width="4" height="4" />
        <rect className="loader-pixel-8" x="4" y="4" width="4" height="4" />
      </svg>

      {activeText && (
        <div
          className={cn("space-y-2", textContainerClassName)}
          aria-hidden="true"
        >
          <p
            key={`${getTextValue(activeText)}-${activeTextIndex}`}
            className={cn(
              "loader-text-entry loader-text-shimmer text-sm leading-6 font-semibold",
              textClassName,
              typeof activeText === "string" ? undefined : activeText.className
            )}
          >
            {getTextValue(activeText)}
          </p>
        </div>
      )}
    </div>
  )
}

export { Loader }
export type { LoaderProps, LoaderText }
