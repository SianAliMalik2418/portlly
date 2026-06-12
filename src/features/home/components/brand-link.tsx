import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"

type BrandLinkProps = {
  animated?: boolean
}

export const BrandLink = ({ animated = false }: BrandLinkProps) => {
  const markClassName =
    "grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-primary text-base text-primary-foreground"

  return (
    <Link
      to="/"
      className="flex items-center gap-[9px] font-display text-[1.0625rem] font-bold tracking-[-0.03em] text-inherit no-underline"
    >
      {animated ? (
        <motion.span
          whileTap={{ rotate: -8, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className={`${markClassName} shadow-[0_3px_0_oklch(0.46_0.12_155)]`}
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
