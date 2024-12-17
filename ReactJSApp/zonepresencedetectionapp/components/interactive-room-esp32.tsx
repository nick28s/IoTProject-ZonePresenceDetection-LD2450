'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Move } from 'lucide-react'

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

const MoveableResizableZone = ({ zone, onResize, onMove, onDelete, isEditMode, roomWidth, roomHeight }: { 
  zone: Zone
  onResize: (id: number, x1: number, y1: number, x2: number, y2: number) => void
  onMove: (id: number, x1: number, y1: number, x2: number, y2: number) => void
  onDelete: (id: number) => void 
  isEditMode: boolean
  roomWidth: number
  roomHeight: number
}) => {
  const zoneRef = useRef<HTMLDivElement>(null)
  const resizeRefs = {
    top: useRef<HTMLDivElement>(null),
    right: useRef<HTMLDivElement>(null),
    bottom: useRef<HTMLDivElement>(null),
    left: useRef<HTMLDivElement>(null),
  }
  const moveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const zoneEl = zoneRef.current
    const moveEl = moveRef.current
    if (!zoneEl || !moveEl) return

    let isResizing = false
    let isMoving = false
    let startX: number, startY: number, startWidth: number, startHeight: number, startLeft: number, startTop: number

    const startResize = (e: MouseEvent | TouchEvent, direction: string) => {
      e.stopPropagation()
      isResizing = true
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY
      startWidth = zoneEl.offsetWidth
      startHeight = zoneEl.offsetHeight
      const resizeHandler = (event: MouseEvent | TouchEvent) => resize(event, direction)
      document.addEventListener('mousemove', resizeHandler)
      document.addEventListener('touchmove', resizeHandler)
      document.addEventListener('mouseup', stopResize)
      document.addEventListener('touchend', stopResize)
    }

    const resize = (e: MouseEvent | TouchEvent, direction: string) => {
      if (!isResizing) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      let width = startWidth
      let height = startHeight
      let x1 = zone.x1
      let y1 = zone.y1
      let x2 = zone.x2
      let y2 = zone.y2

      if (direction === 'right') {
        width = Math.max(20, startWidth + clientX - startX)
        x2 = Math.max(-4000, Math.min(4000, zone.x1 + mapCoordinate(width, 0, roomWidth, 0, 8000)))
      } else if (direction === 'left') {
        width = Math.max(20, startWidth - (clientX - startX))
        x1 = Math.max(-4000, Math.min(4000, zone.x2 - mapCoordinate(width, 0, roomWidth, 0, 8000)))
      }

      if (direction === 'top') {
        height = Math.max(20, startHeight + startY - clientY)
        y2 = Math.max(1, Math.min(8000, zone.y1 + mapCoordinate(height, 0, roomHeight, 0, 8000)))
      } else if (direction === 'bottom') {
        height = Math.max(20, startHeight - (startY - clientY))
        y1 = Math.max(1, Math.min(8000, zone.y2 - mapCoordinate(height, 0, roomHeight, 0, 8000)))
      }

      onResize(zone.id, x1, y1, x2, y2)
    }

    const stopResize = () => {
      isResizing = false
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('touchmove', resize)
      document.removeEventListener('mouseup', stopResize)
      document.removeEventListener('touchend', stopResize)
    }

    const startMove = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()
      isMoving = true
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY
      startLeft = zoneEl.offsetLeft
      startTop = zoneEl.offsetTop
      document.addEventListener('mousemove', move)
      document.addEventListener('touchmove', move)
      document.addEventListener('mouseup', stopMove)
      document.addEventListener('touchend', stopMove)
    }

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isMoving) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const deltaX = clientX - startX
      const deltaY = startY - clientY // Invert the y-axis movement
      const newX1 = Math.max(-4000, Math.min(4000, zone.x1 + mapCoordinate(deltaX, 0, roomWidth, 0, 8000)))
      const newY1 = Math.max(1, Math.min(8000, zone.y1 + mapCoordinate(deltaY, 0, roomHeight, 0, 8000)))
      const width = zone.x2 - zone.x1
      const height = zone.y2 - zone.y1
      const newX2 = Math.max(-4000, Math.min(4000, newX1 + width))
      const newY2 = Math.max(1, Math.min(8000, newY1 + height))
      onMove(zone.id, newX1, newY1, newX2, newY2)
    }

    const stopMove = () => {
      isMoving = false
      document.removeEventListener('mousemove', move)
      document.removeEventListener('touchmove', move)
      document.removeEventListener('mouseup', stopMove)
      document.removeEventListener('touchend', stopMove)
    }

    if (isEditMode) {
      Object.keys(resizeRefs).forEach((direction) => {
        const ref = resizeRefs[direction as keyof typeof resizeRefs].current
        if (ref) {
          ref.addEventListener('mousedown', (e) => startResize(e, direction))
          ref.addEventListener('touchstart', (e) => startResize(e, direction))
        }
      })
      moveEl.addEventListener('mousedown', startMove)
      moveEl.addEventListener('touchstart', startMove)
    }

    return () => {
      Object.keys(resizeRefs).forEach((direction) => {
        const ref = resizeRefs[direction as keyof typeof resizeRefs].current
        if (ref) {
          ref.removeEventListener('mousedown', (e) => startResize(e, direction))
          ref.removeEventListener('touchstart', (e) => startResize(e, direction))
        }
      })
      moveEl.removeEventListener('mousedown', startMove)
      moveEl.removeEventListener('touchstart', startMove)
    }
  }, [zone, onResize, onMove, isEditMode, roomWidth, roomHeight])

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(zone.id)
  }

  const zoneStyle = {
    left: mapCoordinate(zone.x1, -4000, 4000, 0, roomWidth),
    bottom: mapCoordinate(zone.y1, 1, 8000, 0, roomHeight), // Change 'top' to 'bottom'
    width: mapCoordinate(zone.x2 - zone.x1, 0, 8000, 0, roomWidth),
    height: mapCoordinate(zone.y2 - zone.y1, 0, 8000, 0, roomHeight),
  }

  return (
    <div
      ref={zoneRef}
      className={`absolute border-2 ${zone.color}`}
      style={zoneStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 left-0 bg-white text-xs px-1">{zone.id}</div>
      {isEditMode && (
        <>
          <div
            ref={moveRef}
            className="absolute top-1/2 left-1/2 w-6 h-6 bg-white border-2 border-gray-400 cursor-move flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
          >
            <Move className="w-4 h-4 text-gray-600" />
          </div>
          <div
            ref={resizeRefs.top}
            className="absolute top-0 left-1/2 w-4 h-4 bg-white border-2 border-gray-400 cursor-n-resize transform -translate-x-1/2"
          />
          <div
            ref={resizeRefs.right}
            className="absolute top-1/2 right-0 w-4 h-4 bg-white border-2 border-gray-400 cursor-e-resize transform -translate-y-1/2"
          />
          <div
            ref={resizeRefs.bottom}
            className="absolute bottom-0 left-1/2 w-4 h-4 bg-white border-2 border-gray-400 cursor-s-resize transform -translate-x-1/2"
          />
          <div
            ref={resizeRefs.left}
            className="absolute top-1/2 left-0 w-4 h-4 bg-white border-2 border-gray-400 cursor-w-resize transform -translate-y-1/2"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
            onClick={handleDeleteClick}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

export function InteractiveRoomEsp32() {
  const [zones, setZones] = useState<Zone[]>([])
  const [isEditMode, setIsEditMode] = useState(false) // Start with edit mode off
  const roomRef = useRef<HTMLDivElement>(null)
  const [roomSize, setRoomSize] = useState({ width: 0, height: 0 })
  const colors = ['border-red-500', 'border-blue-500', 'border-green-500', 'border-yellow-500', 'border-purple-500', 'border-pink-500']

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

  const createNewZone = () => {
    if (roomRef.current && zones.length < 3) {
      const rect = roomRef.current.getBoundingClientRect()
      const x1 = Math.max(-4000, Math.min(4000, Math.round(mapCoordinate(rect.width / 2, 0, roomSize.width, -4000, 4000))))
      const y1 = Math.max(1, Math.min(8000, Math.round(mapCoordinate(rect.height / 2, 0, roomSize.height, 1, 8000))))
      const x2 = Math.max(-4000, Math.min(4000, x1 + 2000))
      const y2 = Math.min(8000, Math.max(1, y1 + 2000))
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Interactive Room with ESP32 Communication</h1>
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
      </div>
      <p className="mt-4 text-sm text-gray-600">
        {isEditMode
          ? zones.length < 3
            ? "Click 'New Zone' to create zones (max 3). Drag to move, resize from corner."
            : "Maximum number of zones reached. Delete a zone to create a new one."
          : "Edit mode is off. Toggle edit mode to make changes."}
      </p>
      <div className="flex space-x-2">
        <Button onClick={createNewZone} className="mt-4">
          New Zone
        </Button>
        <Button onClick={resetZones} className="mt-4">
          Reset Zones
        </Button>
      </div>
    </div>
  )
}

function resizeHandler(this: Document, ev: MouseEvent) {
  throw new Error('Function not implemented.')
}
