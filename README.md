# Zone Presence Detection System with HLK-LD2450 Radar

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![ESP32](https://img.shields.io/badge/ESP32-Ready-blue)
![React](https://img.shields.io/badge/React-18-61dafb)

A IoT presence detection system combining  radar technology with modern web interface. Perfect for smart home automation, security systems, and occupancy monitoring.
[hackster.io Article](https://www.hackster.io/nick28s/zone-presence-detection-system-c07540)

![alt text](/ui.png) 

## 📋 Table of Contents
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Hardware Setup](#-hardware-setup)
- [Installation](#%EF%B8%8F-installation)
- [Usage Guide](#-usage-guide)
- [Technical Specifications](#-technical-specifications)
- [API Documentation](#-api-documentation)
- [License](#-license)

## 🌟 Features

### Radar Capabilities
- High-precision 24GHz mmWave radar technology
- Real-time tracking of up to 3 targets simultaneously
- Detection range: 6 meters
- Millimeter-level position accuracy
- Non-intrusive presence detection

### Interactive Web Interface
- Real-time position visualization
- Drag-and-drop zone configuration
- Mobile-responsive design
- Live target tracking display
- Visual connection status indicator
- Zone occupancy feedback

### Smart Zone Management
- Create up to 3 customizable detection zones
- Visual zone editing tools
- Zone persistence across sessions
- Real-time zone validation
- Automatic coordinate mapping

### Communication
- WebSocket-based real-time updates
- RESTful API for zone configuration
- Robust error handling
- Automatic reconnection
- Secure data transmission

## 🏗 System Architecture

### Hardware Layer
- **HLK-LD2450 Radar Sensor**
  - 24GHz mmWave technology
  - Serial communication interface
  - Built-in target tracking algorithms
  - Low power consumption

- **ESP32 Controller**
  - Dual-core processor
  - WebSocket server
  - REST API endpoint
  - WiFi connectivity
  - Serial communication handler

### Software Layer
- **ESP32 Firmware**
  - FreeRTOS task management
  - WebSocket server implementation
  - JSON data processing
  - Zone calculation algorithms

- **React Web Application**
  - Modern React 18 with hooks
  - Real-time WebSocket client
  - Interactive zone editor
  - Responsive design system
  - Error boundary implementation

### Data Flow
1. Radar sensor captures position data
2. ESP32 processes and validates data
3. Zone presence is calculated
4. Data is streamed via WebSocket
5. Web interface updates in real-time

## 🔧 Hardware Setup

### Components List
- HLK-LD2450 24GHz radar sensor
- ESP32 development board
- USB-C power supply (5V)
- Jumper wires
- Optional: 3D printed case

### Wiring Diagram
```
HLK-LD2450  |  ESP32-WROOM
---------------------------
     5V     |     5V/VIN
    GND     |      GND
     TX     |  GPIO16 (RX2)
     RX     |  GPIO17 (TX2)
```

### Mounting Recommendations
- Mount radar sensor at 1.2-1.5m height
- Ensure clear line of sight
- Avoid metal obstacles
- Keep away from WiFi antennas

## ⚙️ Installation

### ESP32 Development Setup
1. Install Visual Studio Code
2. Install PlatformIO Extension
3. Clone repository:
   ```bash
   git clone https://github.com/yourusername/ZonePresenceDetection.git
   ```
4. Configure WiFi credentials:
   ```cpp
   // WiFiCredentials.h
   #define WIFI_SSID "your_ssid"
   #define WIFI_PASSWORD "your_password"
   ```
5. Upload firmware via PlatformIO

### Web Application Setup

Use Docker and
install from the command line:
```bash
docker pull ghcr.io/nick28s/iotproject-zonepresencedetection-ld2450:latest
```
```bash
docker run -p 3000:3000 --name zoneapp ghcr.io/nick28s/iotproject-zonepresencedetection-ld2450-arm64:latest 
```

or

Install manually:

1. Install Node.js (v16+)
2. Navigate to web app directory:
   ```bash
   cd ReactJSApp/zonepresencedetectionapp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure ESP32 IP address:
   - Open `config/index.ts`
   - Update the ESP32_IP constant with your ESP32's IP address:
   ```typescript
   const ESP32_IP = 'YOUR_ESP32_IP_HERE' // e.g., '192.168.1.100'
   ```
   Note: You can find the ESP32's IP address in the Serial Monitor after the device connects to WiFi
5. Start development server:
   ```bash
   npm run dev
   ```

## 🎯 Usage Guide

### Initial Setup
1. Power up ESP32
2. Note the ESP32's IP address from Serial Monitor output
3. Configure the IP address in the web application (see Web Application Setup step 4)
4. Open web interface at http://localhost:3000
5. Configure initial zones

### Zone Configuration
1. Enable "Edit Mode"
2. Click "New Zone" to create zone
3. Drag to position
4. Use handles to resize
5. Save configuration

### Real-time Monitoring
- View live target positions
- Monitor zone occupancy
- Check connection status
- View target trajectories

## 🔍 Technical Specifications

### Radar Parameters
- Frequency: 24GHz
- Range: 6m
- Update rate: 20Hz
- Resolution: 1mm
- Field of view: 120°

### Zone Configuration
- Maximum zones: 3
- X range: -4000 to 4000mm
- Y range: 1 to 6000mm
- Minimum size: 20x20mm
- Maximum size: 8000x6000mm

## 📡 API Documentation

### WebSocket Endpoint
- URL: `ws://<ESP32_IP>/ws`
- Protocol: WebSocket
- Format: JSON

### REST Endpoints
- Zone Configuration:
  ```
  GET  /zones          // Fetch zones
  POST /updateZones    // Update zones
  ```

### Data Formats
```json
{
  "zones": [
    {
      "id": 1,
      "x1": -4000,
      "y1": 1,
      "x2": 4000,
      "y2": 6000
    }
  ]
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
