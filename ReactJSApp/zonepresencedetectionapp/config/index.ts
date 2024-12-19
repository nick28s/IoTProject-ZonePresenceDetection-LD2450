const ESP32_IP = '192.168.178.145'

export const config = {
  esp32: {
    ip: ESP32_IP,
    webSocketUrl: `ws://${ESP32_IP}/ws`,
    apiBaseUrl: `http://${ESP32_IP}`,
    endpoints: {
      zones: '/zones',
      updateZones: '/updateZones'
    }
  },
  room: {
    coordinates: {
      minX: -4000,
      maxX: 4000,
      minY: 1,
      maxY: 6000,
      width: 8000,  // maxX - minX
      height: 6000  // maxY - minY
    }
  },
  zones: {
    maxCount: 3,
    defaultSize: 2000,
    minSize: 20,
    colors: ['border-blue-400', 'border-green-400', 'border-red-400']
  },
  users: {
    colors: ['bg-purple-500', 'bg-green-500', 'bg-yellow-500']
  },
  ui: {
    animations: {
      wifiPulseInterval: 500 // ms
    }
  }
}
