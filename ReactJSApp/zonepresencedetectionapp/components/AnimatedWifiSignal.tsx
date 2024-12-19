import { useState, useEffect } from 'react'
import { WifiZero, WifiLow, WifiHigh, Wifi } from 'lucide-react'

export function AnimatedWifiSignal() {
  const [signalIndex, setSignalIndex] = useState(0)
  const signals = [
    <WifiZero key="off" className="w-6 h-6 text-gray-600" />,
    <WifiLow key="low" className="w-6 h-6 text-gray-600" />,
    <WifiHigh key="medium" className="w-6 h-6 text-gray-600" />,
    <Wifi key="full" className="w-6 h-6 text-gray-600" />
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setSignalIndex((current) => (current + 1) % signals.length)
    }, 500) // Change every 500ms

    return () => clearInterval(interval)
  }, [])

  return signals[signalIndex]
}
