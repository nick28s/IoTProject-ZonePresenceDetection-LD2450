import { NextResponse } from 'next/server'
import { getConfig } from '@/config'

let zones = [
  { x1: 1, y1: 1, x2: 4000, y2: 4000 },
  { x1: -4000, y1: 1, x2: -1, y2: 4000 },
  { x1: -4001, y1: 4001, x2: 4001, y2: 8000 }
]

export async function GET(request: Request) {
  const esp32Ip = request.headers.get('x-esp32-ip') || getConfig().esp32.defaultIp
  const config = getConfig(esp32Ip)
  const ESP32_URL_GETZONES = `${config.esp32.apiBaseUrl}${config.esp32.endpoints.zones}`

  try {
    // Anfrage an den ESP32 senden
    const response = await fetch(ESP32_URL_GETZONES, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch zones from ESP32. Status: ${response.status}`)
    }

    // Zonen vom ESP32 abrufen und zurückgeben
    const esp32Zones = await response.json()
    console.log('Zones fetched from ESP32:', esp32Zones)

    return NextResponse.json(esp32Zones)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching zones from ESP32:', errorMessage)

    // Wenn die ESP32-Anfrage fehlschlägt, geben wir die lokal gespeicherten Zonen zurück
    return NextResponse.json(
      { 
        message: 'Failed to fetch zones from ESP32.',
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const esp32Ip = request.headers.get('x-esp32-ip') || getConfig().esp32.defaultIp
  const config = getConfig(esp32Ip)
  const ESP32_URL = `${config.esp32.apiBaseUrl}${config.esp32.endpoints.updateZones}`
  const newZones = await request.json()

  // Ensure we only have up to 3 zones
  zones = newZones.slice(0, config.zones.maxCount)

  // Validate and constrain zone coordinates
  zones = zones.map(zone => ({
    x1: Math.round(Math.max(config.room.coordinates.minX, Math.min(config.room.coordinates.maxX, zone.x1))),
    y1: Math.round(Math.max(config.room.coordinates.minY, Math.min(config.room.coordinates.maxY, zone.y1))),
    x2: Math.round(Math.max(config.room.coordinates.minX, Math.min(config.room.coordinates.maxX, zone.x2))),
    y2: Math.round(Math.max(config.room.coordinates.minY, Math.min(config.room.coordinates.maxY, zone.y2)))
  }))

  try {
    // Send updated zones to ESP32
    const response = await fetch(ESP32_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zones)
    })

    if (!response.ok) {
      throw new Error(`Failed to send zones to ESP32. Status: ${response.status}`)
    }

    console.log('Zones successfully sent to ESP32:', zones)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending zones to ESP32:', errorMessage);
    return NextResponse.json(
      { message: 'Failed to update zones on ESP32', error: errorMessage },
      { status: 500 }
    );
  }
  

  return NextResponse.json({ message: 'Zones updated successfully and sent to ESP32' })
}
