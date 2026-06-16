import type { ComponentType } from "react"
import { NearoLogo } from "@/components/nearo-logo"
import { TickrLogo } from "@/components/tickr-logo"

export type ArcadeCardTheme = {
  bg: string
  gradient: string
  border: string
  badge: string
  badgeLabel: string
  button: string
}

export type ArcadeDemoPill = {
  label: string
  value: string
  style: "score-color" | "outline"
  score?: number
}

export type ArcadeCardConfig = {
  theme: ArcadeCardTheme
  logo: ComponentType<{ className?: string }>
  demoPills: ReadonlyArray<ArcadeDemoPill>
  coverImages?: { light: string; dark: string }
}

export const arcadeCards: Record<string, ArcadeCardConfig> = {
  nearo: {
    theme: {
      bg: "bg-[#07110d]",
      gradient:
        "bg-[linear-gradient(180deg,rgba(45,60,45,0.82)_0%,rgba(45,60,45,0.5)_60%,rgba(45,60,45,0.2)_100%)] sm:bg-[linear-gradient(90deg,rgba(45,60,45,0.78)_0%,rgba(45,60,45,0.5)_28%,rgba(45,60,45,0.12)_52%,transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_60%,rgba(0,0,0,0.15)_100%)] dark:sm:bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_28%,rgba(0,0,0,0.08)_55%,transparent_100%)]",
      border: "border-[#e7d9a8]/70",
      badge: "bg-[#1f5f35]/90",
      badgeLabel: "Featured",
      button:
        "bg-[#3d9a54] shadow-[0_0.1875rem_0_#1e6531] hover:bg-[#49aa61]",
    },
    logo: NearoLogo,
    demoPills: [
      { label: "planet", value: "94", style: "score-color", score: 94 },
      { label: "orbit", value: "68", style: "score-color", score: 68 },
      { label: "cloud", value: "41", style: "score-color", score: 41 },
    ],
    coverImages: {
      light: "/assets/nearo-cover-image.png",
      dark: "/assets/nearo-cover-image-dark.png",
    },
  },
  tickr: {
    theme: {
      bg: "bg-[#0d0a14]",
      gradient:
        "bg-[linear-gradient(180deg,rgba(50,35,80,0.85)_0%,rgba(50,35,80,0.5)_60%,rgba(50,35,80,0.2)_100%)] sm:bg-[linear-gradient(90deg,rgba(50,35,80,0.82)_0%,rgba(50,35,80,0.5)_28%,rgba(50,35,80,0.12)_52%,transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_60%,rgba(0,0,0,0.15)_100%)] dark:sm:bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_28%,rgba(0,0,0,0.08)_55%,transparent_100%)]",
      border: "border-[#c4a8e7]/70",
      badge: "bg-[#4a2d7a]/90",
      badgeLabel: "New",
      button:
        "bg-[#7c4dbd] shadow-[0_0.1875rem_0_#4a2d7a] hover:bg-[#8f5fd0]",
    },
    logo: TickrLogo,
    demoPills: [
      { label: "30s", value: "", style: "outline" },
      { label: "60s", value: "", style: "outline" },
      { label: "90s", value: "", style: "outline" },
    ],
  },
}
