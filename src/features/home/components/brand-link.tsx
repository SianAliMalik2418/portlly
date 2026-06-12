import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"

type BrandLinkProps = {
  animated?: boolean
}

export const BrandLink = ({ animated = false }: BrandLinkProps) => {
  const markClassName =
    "grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-base text-primary-foreground"

  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 font-display text-[1.0625rem] font-bold tracking-[-0.03em] text-inherit no-underline"
    >
      {animated ? (
        <motion.span
          whileTap={{ transform: "rotate(-8deg) scale(0.92)" }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className={`${markClassName} shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]`}
        >
          p
        </motion.span>
      ) : (
        <span className={markClassName}>p</span>
      )}
      portlly
    </Link>
  )
}
