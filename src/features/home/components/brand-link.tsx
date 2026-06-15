import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { PortllyLogo } from "@/components/portlly-logo"

type BrandLinkProps = {
  animated?: boolean
}

export const BrandLink = ({ animated = false }: BrandLinkProps) => {
  return (
    <Link to="/" className="flex items-center text-inherit no-underline">
      {animated ? (
        <motion.span
          whileTap={{ y: 1, rotate: -2, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <PortllyLogo />
        </motion.span>
      ) : (
        <PortllyLogo />
      )}
    </Link>
  )
}
