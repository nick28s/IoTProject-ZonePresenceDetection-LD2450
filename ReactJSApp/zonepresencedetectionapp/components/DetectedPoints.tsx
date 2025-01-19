import { Point } from '@/types'
import { mapCoordinate } from '@/utils/coordinates'
import { CircleUserRound } from 'lucide-react'


interface DetectedPointsProps {
  points: Point[]
  roomWidth: number
  roomHeight: number
}

// Replace hardcoded colors
const userColors = ['bg-purple-500', 'bg-green-500', 'bg-yellow-500']

export function DetectedPoints({ points, roomWidth, roomHeight }: DetectedPointsProps) {
  return (
    <>
      {points.map((point, index) => {
        if (point.x === 0 && point.y === 0) return null

        return (
          <div
            key={point.id}
            className={`absolute rounded-full ${userColors[index % userColors.length]}`}
            style={{
              left: mapCoordinate(point.x, -4000, 4000, 0, roomWidth),
              bottom: mapCoordinate(point.y, 1, 6000, 0, roomHeight),
            }}
          >
            <CircleUserRound className="w-6 h-6 text-white p-0.5" />
          </div>
        )
      })}
    </>
  )
}
