import { useState, useEffect } from 'react'
import { Point } from '@/types'

export const useWebSocket = (url: string) => {
  const [points, setPoints] = useState<Point[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setPoints((prevPoints) => {
        const existingPointIndex = prevPoints.findIndex((point) => point.id === data.id)
        if (existingPointIndex !== -1) {
          const updatedPoints = [...prevPoints]
          updatedPoints[existingPointIndex] = { id: data.id, x: data.x, y: data.y }
          return updatedPoints
        }
        return [...prevPoints, { id: data.id, x: data.x, y: data.y }]
      })
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    return () => ws.close()
  }, [url])

  return { points, isConnected }
}
