import { useEffect, useState } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { nearoConfig } from "../config"

const TOUR_KEY = `${nearoConfig.storagePrefix}:tour-seen`

const hasSeen = () => {
  try {
    return localStorage.getItem(TOUR_KEY) === "1"
  } catch {
    return false
  }
}

const markSeen = () => {
  try {
    localStorage.setItem(TOUR_KEY, "1")
  } catch {}
}

export const useGameTour = () => {
  const [tourActive, setTourActive] = useState(() => !hasSeen())

  useEffect(() => {
    if (!tourActive) return

    const timeout = setTimeout(() => {
      const tour = driver({
        showProgress: true,
        animate: true,
        overlayColor: "black",
        overlayOpacity: 0.4,
        popoverClass: "nearo-tour",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Let's play!",
        steps: [
          {
            element: "#nearo-input",
            popover: {
              title: "Guess a word",
              description:
                "Type any word and press enter. You're trying to find the secret word by meaning — not spelling.",
              side: "top",
              align: "center",
            },
          },
          {
            element: "#nearo-status",
            popover: {
              title: "Track your progress",
              description:
                "Each guess gets a similarity score from 0–100%. The closer in meaning, the higher the score. Hit 100% to win.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#nearo-guesses",
            popover: {
              title: "Your guesses",
              description:
                "Guesses are sorted by score. Close words also show a rank — lower rank means you're getting warmer.",
              side: "top",
              align: "center",
            },
          },
          {
            element: "#nearo-hint",
            popover: {
              title: "Need help?",
              description:
                "After 10 guesses, you unlock a hint. It reveals a word that's better than your current best.",
              side: "top",
              align: "end",
            },
          },
        ],
        onDestroyed: () => {
          markSeen()
          setTourActive(false)
        },
      })

      tour.drive()
    }, 600)

    return () => clearTimeout(timeout)
  }, [tourActive])

  return { tourActive }
}
