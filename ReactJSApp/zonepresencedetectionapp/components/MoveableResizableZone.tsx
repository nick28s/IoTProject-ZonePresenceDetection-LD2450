'use client'

import { useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
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

export const MoveableResizableZone = ({ zone, onResize, onMove, onDelete, isEditMode, roomWidth, roomHeight }: { 
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
    let startX: number, startY: number, startWidth: number, startHeight: number
    let currentDirection: string = ''

    // Create a closure to hold the direction
    const startResize = (direction: string) => (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()
      isResizing = true
      currentDirection = direction
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY
      startWidth = zoneEl.offsetWidth
      startHeight = zoneEl.offsetHeight
      
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('touchmove', handleResize)
      document.addEventListener('mouseup', stopResize)
      document.addEventListener('touchend', stopResize)
    }

    // Modify resize to use the stored direction
    const handleResize = (e: MouseEvent | TouchEvent) => {
      resize(e, currentDirection)
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
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('touchmove', handleResize)
      document.removeEventListener('mouseup', stopResize)
      document.removeEventListener('touchend', stopResize)
    }

    const startMove = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()
      isMoving = true
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY
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
      let newX1 = Math.max(-4000, Math.min(4000, zone.x1 + mapCoordinate(deltaX, 0, roomWidth, 0, 8000)))
      let newY1 = Math.max(1, Math.min(8000, zone.y1 + mapCoordinate(deltaY, 0, roomHeight, 0, 8000)))
      const width = zone.x2 - zone.x1
      const height = zone.y2 - zone.y1
      let newX2 = newX1 + width
      let newY2 = newY1 + height

      // Prevent moving beyond the right or top edges
      if (newX2 > 4000) {
        newX1 = 4000 - width
        newX2 = 4000
      }
      if (newY2 > 8000) {
        newY1 = 8000 - height
        newY2 = 8000
      }

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
          // Use the new startResize function
          ref.addEventListener('mousedown', startResize(direction))
          ref.addEventListener('touchstart', startResize(direction))
        }
      })
      moveEl.addEventListener('mousedown', startMove)
      moveEl.addEventListener('touchstart', startMove)
    }

    return () => {
      Object.keys(resizeRefs).forEach((direction) => {
        const ref = resizeRefs[direction as keyof typeof resizeRefs].current
        if (ref) {
          // Clean up with the same function reference
          ref.removeEventListener('mousedown', startResize(direction))
          ref.removeEventListener('touchstart', startResize(direction))
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
      {isEditMode ? (
      <>
        <div className="absolute top-0 left-0 text-xs px-1">{zone.id}</div>
        <div
        ref={moveRef}
        className="absolute top-1/2 left-1/2 w-full h-full cursor-move flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 bg-white opacity-50"
        >
        <Move className="w-4 h-4 text-gray-600" />
        </div>
        <div
        ref={resizeRefs.top}
        className="absolute left-1/2 w-8 h-3 bg-white border-2 border-gray-400 cursor-n-resize transform -translate-x-1/2 -top-[7px] rounded-full"
        />
        <div
        ref={resizeRefs.right}
        className="absolute top-1/2 w-3 h-8 bg-white border-2 border-gray-400 cursor-e-resize transform -translate-y-1/2 -right-[7px] rounded-full"
        />
        <div
        ref={resizeRefs.bottom}
        className="absolute left-1/2 w-8 h-3 bg-white border-2 border-gray-400 cursor-s-resize transform -translate-x-1/2 -bottom-[7px] rounded-full"
        />
        <div
        ref={resizeRefs.left}
        className="absolute top-1/2 w-3 h-8 bg-white border-2 border-gray-400 cursor-w-resize transform -translate-y-1/2 -left-[7px] rounded-full"
        />
        <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
        onClick={handleDeleteClick}
        >
        <X className="h-4 w-4" />
        </Button>
      </>
      ) : (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl opacity-40">
        {zone.id}
      </div>
      )}
    </div>
  )
}
