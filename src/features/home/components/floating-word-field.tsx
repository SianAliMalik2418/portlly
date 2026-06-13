import { motion } from "framer-motion"
import { floatingWords } from "../lib/games"

const colors = [
  "oklch(0.70 0.12 250)",
  "oklch(0.84 0.13 130)",
  "oklch(0.80 0.16 60)",
  "oklch(0.66 0.20 35)",
] as const

export const FloatingWordField = () => (
  <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
    {floatingWords.map((floatingWord, index) => (
      <motion.span
        key={floatingWord.word}
        className="absolute rounded-full px-3 py-[0.4375rem] font-mono text-[0.8125rem] font-bold text-white opacity-90 shadow-[0_0.75rem_1.5rem_oklch(0_0_0_/_12%)]"
        style={{
          left: `${floatingWord.x}%`,
          top: `${floatingWord.y}%`,
          background: colors[index % colors.length],
          rotate: `${floatingWord.rotation}deg`,
        }}
        animate={{
          transform: [
            "translateY(0px)",
            "translateY(-14px)",
            "translateY(0px)",
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatingWord.delay,
        }}
      >
        {floatingWord.word}
      </motion.span>
    ))}
  </div>
)
