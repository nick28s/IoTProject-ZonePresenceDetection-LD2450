const DEFAULT_ESP32_IP = '192.168.178.145'

export const getConfig = (ip: string = DEFAULT_ESP32_IP) => ({
  esp32: {
    ip,
    defaultIp: DEFAULT_ESP32_IP,
    webSocketUrl: `ws://${ip}/ws`,
    apiBaseUrl: `http://${ip}`,
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
    colors: ['border-blue-400']
  },
  users: {
    colors: ['bg-purple-500', 'bg-green-500', 'bg-yellow-500']
  },
  ui: {
    animations: {
      wifiPulseInterval: 500 // ms
    }
  }
})

export const config = getConfig()
