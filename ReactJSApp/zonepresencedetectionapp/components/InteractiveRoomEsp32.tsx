'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MoveableResizableZone } from './MoveableResizableZone'
import { CircleUserRound, Radio } from 'lucide-react'

const mapCoordinate = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

interface Zone {
  id: number
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

interface Point {
  id: number
  x: number
  y: number
}

export function InteractiveRoomEsp32() {
  const [zones, setZones] = useState<Zone[]>([])
  const [points, setPoints] = useState<Point[]>([]) // State to store points
  const [isEditMode, setIsEditMode] = useState(false) // Start with edit mode off
  const roomRef = useRef<HTMLDivElement>(null)
  const [roomSize, setRoomSize] = useState({ width: 0, height: 0 })
  const colors = ['border-blue-400']

  useEffect(() => {
    const updateRoomSize = () => {
      if (roomRef.current) {
        setRoomSize({
          width: roomRef.current.offsetWidth,
          height: roomRef.current.offsetHeight
        })
      }
    }

    updateRoomSize()
    window.addEventListener('resize', updateRoomSize)
    return () => window.removeEventListener('resize', updateRoomSize)
  }, [])

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch('/api/zones')
        if (response.ok) {
          const data = await response.json()
          setZones(data.map((zone: Zone, index: number) => ({
            ...zone,
            id: index + 1, // Assign IDs 1, 2, 3
            color: colors[index % colors.length],
          })))
        }
      } catch (error) {
        console.error('Failed to fetch zones:', error)
      }
    }

    fetchZones()
  }, [])

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.178.145/ws') // Replace with your ESP32 WebSocket URL

    ws.onopen = () => {
      console.log('WebSocket connection established.');
    }

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const data = JSON.parse(event.data)
      setPoints((prevPoints) => {
        const existingPointIndex = prevPoints.findIndex((point) => point.id === data.id)
        if (existingPointIndex !== -1) {
          const updatedPoints = [...prevPoints]
          updatedPoints[existingPointIndex] = { id: data.id, x: data.x, y: data.y }
          return updatedPoints
        } else {
          return [...prevPoints, { id: data.id, x: data.x, y: data.y }]
        }
      })
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    }

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
    }

    return () => {
      ws.close()
    }
  }, [])

  const createNewZone = () => {
    if (roomRef.current && zones.length < 3) {
      const rect = roomRef.current.getBoundingClientRect()
      const x1 = Math.max(-4000, Math.min(4000, Math.round(mapCoordinate(rect.width / 2, 0, roomSize.width, -4000, 4000))))
      const y1 = Math.max(1, Math.min(6000, Math.round(mapCoordinate(rect.height / 2, 0, roomSize.height, 1, 6000))))
      const x2 = Math.max(-4000, Math.min(4000, x1 + 2000))
      const y2 = Math.min(6000, Math.max(1, y1 + 2000))
      const color = colors[zones.length % colors.length]
      const newZone = { id: zones.length + 1, x1, y1, x2, y2, color } // Assign new ID
      setZones(prevZones => [...prevZones, newZone])
      sendZoneUpdate([...zones, newZone])
    }
  }

  const resetZones = () => {
    setZones([])
    sendZoneUpdate([])
  }

  const handleResize = (id: number, x1: number, y1: number, x2: number, y2: number) => {
    const updatedZones = zones.map(zone =>
      zone.id === id ? { ...zone, x1, y1, x2, y2 } : zone
    )
    setZones(updatedZones)
    sendZoneUpdate(updatedZones)
  }

  const handleMove = (id: number, x1: number, y1: number, x2: number, y2: number) => {
    const updatedZones = zones.map(zone =>
      zone.id === id ? { ...zone, x1, y1, x2, y2 } : zone
    )
    setZones(updatedZones)
    sendZoneUpdate(updatedZones)
  }

  const handleDelete = (id: number) => {
    const updatedZones = zones.filter(zone => zone.id !== id)
    setZones(updatedZones)
    sendZoneUpdate(updatedZones)
  }

  const sendZoneUpdate = async (updatedZones: Zone[]) => {
    if (!isEditMode) {
      const esp32Zones = updatedZones.map(({ id, x1, y1, x2, y2 }) => ({ id, x1, y1, x2, y2 }))
      try {
        const response = await fetch('/api/zones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(esp32Zones),
        })
        if (!response.ok) {
          throw new Error('Failed to update zones')
        }
      } catch (error) {
        console.error('Error updating zones:', error)
      }
    }
  }

  const sendFinalZoneUpdate = async () => {
    const esp32Zones = zones.map(({ id, x1, y1, x2, y2 }) => ({ id, x1, y1, x2, y2 }))
    try {
      const response = await fetch('/api/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(esp32Zones),
      })
      if (!response.ok) {
        throw new Error('Failed to update zones')
      }
    } catch (error) {
      console.error('Error updating zones:', error)
    }
  }

  useEffect(() => {
    const room = roomRef.current
    if (room) {
      const handleTouchStart = (e: TouchEvent) => {
        // Add your touch start logic here
      }
      room.addEventListener('touchstart', handleTouchStart)
      return () => {
        room.removeEventListener('touchstart', handleTouchStart)
      }
    }
  }, [isEditMode])

  const userColors = ['bg-purple-500', 'bg-green-500', 'bg-yellow-500']

  return (
    <div className="select-none flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Zone Presence Detection App</h1>
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="edit-mode"
          checked={isEditMode}
          onCheckedChange={(checked) => {
            setIsEditMode(checked)
            if (!checked) {
              sendFinalZoneUpdate()
            }
          }}
        />
        <Label htmlFor="edit-mode">Edit Mode</Label>
      </div>
      <div 
        ref={roomRef}
        className={`w-full max-w-2xl h-96 bg-white border-2 border-gray-300 relative ${isEditMode ? 'cursor-crosshair' : 'cursor-default'}`}
      >
        {/* Sensor icon */}
        <div
          className="absolute"
          style={{
            left: mapCoordinate(0, -4000, 4000, 0, roomSize.width),
            bottom: 0,
            transform: 'translate(-50%, 50%)',
            zIndex: 50
          }}
        >
          <Radio className="w-6 h-6 text-gray-600" />
        </div>

        {zones.map(zone => (
          <MoveableResizableZone 
            key={zone.id} 
            zone={zone} 
            onResize={handleResize} 
            onMove={handleMove}
            onDelete={handleDelete}
            isEditMode={isEditMode}
            roomWidth={roomSize.width}
            roomHeight={roomSize.height}
          />
        ))}
        {points.map((point, index) => {
          if (point.x == 0 && point.y == 0) {
            return (
              <div
                key={point.id}
                className={"absolute rounded-full " + userColors[index % userColors.length] + " invisible"}
                style={{
                  left: mapCoordinate(point.x, -4000, 4000, 0, roomSize.width),
                  bottom: mapCoordinate(point.y, 1, 6000, 0, roomSize.height),
                }}
              >
                <CircleUserRound className="w-6 h-6 text-white p-0.5" />
              </div>
            );
          }
          return (
            <div
              key={point.id}
              className={"absolute rounded-full " + userColors[index % userColors.length]}
              style={{
                left: mapCoordinate(point.x, -4000, 4000, 0, roomSize.width),
                bottom: mapCoordinate(point.y, 1, 6000, 0, roomSize.height),
              }}
            >
              <CircleUserRound className="w-6 h-6 text-white p-0.5" />
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        {isEditMode
          ? zones.length < 3
            ? "Click 'New Zone' to create zones (max 3). Drag to move, resize from corner."
            : "Maximum number of zones reached. Delete a zone to create a new one."
          : "Edit mode is off. Toggle edit mode to make changes."}
      </p>
      <div className="flex space-x-2 min-h-[5rem]">
      {isEditMode && (
        <>
        <Button onClick={createNewZone} className="mt-4">
            New Zone
        </Button>
        <Button onClick={resetZones} className="mt-4">
            Reset Zones
        </Button></>
      )} 
      </div>
    </div>
  )
}
