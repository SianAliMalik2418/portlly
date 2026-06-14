import { useEffect, useState } from "react"

const scrolledThreshold = 8

export const usePageScrolled = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > scrolledThreshold)

    updateScrolled()
    window.addEventListener("scroll", updateScrolled, { passive: true })

    return () => window.removeEventListener("scroll", updateScrolled)
  }, [])

  return scrolled
}
