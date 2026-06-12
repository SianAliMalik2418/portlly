import { motion } from "framer-motion"
import { floatingWords } from "../lib/games"
import { getTemperatureColor } from "../lib/temperature"

export const FloatingWordField = () => (
  <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
    {floatingWords.map((floatingWord) => (
      <motion.span
        key={floatingWord.word}
        className="absolute rounded-full px-3 py-[0.4375rem] font-mono text-[0.8125rem] font-bold text-white opacity-90 shadow-[0_0.75rem_1.5rem_oklch(0_0_0_/_12%)]"
        style={{
          left: `${floatingWord.x}%`,
          top: `${floatingWord.y}%`,
          background: getTemperatureColor(floatingWord.temperature),
          rotate: `${floatingWord.rotation}deg`,
        }}
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatingWord.delay,
        }}
      >
        {floatingWord.word} {Math.round(floatingWord.temperature * 100)}
      </motion.span>
    ))}
  </div>
)
