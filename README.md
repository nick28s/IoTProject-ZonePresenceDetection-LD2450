# Zone Presence Detection with HLK-LD2450 Radar Sensor

This project utilizes the HLK-LD2450 24GHz human radar sensor to implement zone presence detection for IoT applications. The sensor detects movement and presence within designated zones, making it suitable for smart home and security systems.

## Hardware Requirements

- HLK-LD2450 radar sensor
- ESP32 development board
- Jumper wires

## Wiring Diagram

| HLK-LD2450 | ESP32          |
|------------|----------------|
| 5V         | 5V             |
| GND        | GND            |
| TX         | GPIO16 (RX2)   |
| RX         | GPIO17 (TX2)   |

## Installation

1. Install the `LD2450` library via the PlatformIO Library Manager.
2. Set up the ESP32 development environment with PlatformIO.

## Usage

Include the LD2450 library in your project and initialize the sensor in your code. Use the provided methods to read data from the sensor and handle presence detection logic.

## Example

```cpp
#include <LD2450.h>

LD2450 ld2450;

void setup() {
    Serial.begin(115200);
    ld2450.begin(Serial2, false);
}

void loop() {
    if (ld2450.read() > 0) {
        Serial.println(ld2450.getLastTargetMessage());
    }
}
```

## Web Application

A ReactJS web application is provided to interact with the ESP32 and visualize the zones. The application allows you to create, move, resize, and delete zones.

### Features

- Create up to 3 zones
- Move and resize zones
- Display zone IDs
- Toggle edit mode
- Send zone data to ESP32

### Installation

1. Navigate to the `ReactJSApp` directory.
2. Install dependencies:
    ```sh
    npm install
    ```
3. Start the development server:
    ```sh
    npm start
    ```

### API Endpoints

- `GET /api/zones`: Fetch the current zones from the ESP32.
- `POST /api/zones`: Update the zones on the ESP32.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
