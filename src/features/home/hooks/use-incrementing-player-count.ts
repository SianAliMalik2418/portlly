import { useEffect, useState } from "react"

const initialPlayerCount = 18_402
const incrementIntervalMs = 2_600

export const useIncrementingPlayerCount = () => {
  const [playerCount, setPlayerCount] = useState(initialPlayerCount)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlayerCount((count) => count + Math.floor(Math.random() * 5))
    }, incrementIntervalMs)

    return () => clearInterval(intervalId)
  }, [])

  return playerCount
}
