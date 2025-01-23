#include <Arduino.h>
#include <LD2450.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <AsyncWebSocket.h>
#include "WiFiCredentials.h"

const int ledPin = 2;

String last_target_data = "";

// SENSOR INSTANCE
LD2450 ld2450;

boolean zone1, zone2, zone3;

// Create an AsyncWebServer on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws"); // Set up WebSocket on "/ws"

// Define zones as rectangles with (x1, y1)LeftDownCorner and (x2, y2)RightUpCorner
struct Zone
{
  int x1, y1, x2, y2;
};

Zone zones[3] = {
    {-4000, 1, -1, 4000},     // Zone 2
    {1, 1, 4000, 4000},       // Zone 1
    {-4001, 4001, 4001, 6000} // Zone 3
};

bool tempZone1 = false;
bool tempZone2 = false;
bool tempZone3 = false;

const char *ssid = WIFI_SSID;
const char *password = WIFI_PASSWORD;

WiFiClient espClient;

void setup_wifi()
{
  delay(10);
  // connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// WebSocket event handling
void onWebSocketEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{
  if (type == WS_EVT_CONNECT)
  {
    Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
  }
  else if (type == WS_EVT_DISCONNECT)
  {
    Serial.printf("WebSocket client #%u disconnected\n", client->id());
  }
}

void setup()
{
  // Initialize serial and wait for port to open:
  Serial.begin(115200);
  // This delay gives the chance to wait for a Serial Monitor without blocking if none is found
  delay(1500);
  ld2450.setNumberOfTargets(3);
  // SETUP SENSOR USING HARDWARE SERIAL INTERFACE 2
  ld2450.begin(Serial2, false);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  zone1 = false;
  zone2 = false;
  zone3 = false;

  setup_wifi();

  // Initialize WebSocket
  ws.onEvent(onWebSocketEvent);
  server.addHandler(&ws);

  // Debugging log
  Serial.println("WebSocket server initialized.");

  // Set up POST endpoint
  server.on("/updateZones", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total)
            {
      // Process JSON data
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, data, len);

      if (error) {
        Serial.print("JSON parsing failed: ");
        Serial.println(error.c_str());
        request->send(400, "application/json", "{\"status\":\"error\",\"message\":\"Invalid JSON\"}");
        return;
      }

      // Write JSON data into the Zone struct
      for (int i = 0; i < 3; i++) {
        zones[i].x1 = doc[i]["x1"] | zones[i].x1; // Default value if JSON value is missing
        zones[i].y1 = doc[i]["y1"] | zones[i].y1;
        zones[i].x2 = doc[i]["x2"] | zones[i].x2;
        zones[i].y2 = doc[i]["y2"] | zones[i].y2;

        // Debug output
        Serial.print("Zone ");
        Serial.print(i + 1);
        Serial.print(": x1=");
        Serial.print(zones[i].x1);
        Serial.print(", y1=");
        Serial.print(zones[i].y1);
        Serial.print(", x2=");
        Serial.print(zones[i].x2);
        Serial.print(", y2=");
        Serial.println(zones[i].y2);
      }

      // Send success message
      request->send(200, "application/json", "{\"status\":\"success\",\"message\":\"Zones updated\"}"); });

  // Handle GET request for zones
  server.on("/zones", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    StaticJsonDocument<512> doc;
    
    // Serialize zones into JSON array
    JsonArray zonesArray = doc.to<JsonArray>();
    for (int i = 0; i < 3; i++) {
      JsonObject zone = zonesArray.createNestedObject();
      zone["x1"] = zones[i].x1;
      zone["y1"] = zones[i].y1;
      zone["x2"] = zones[i].x2;
      zone["y2"] = zones[i].y2;
    }

    String jsonResponse;
    serializeJson(doc, jsonResponse);

    // Send JSON response
    request->send(200, "application/json", jsonResponse); });

  // Start server
  server.begin();
  Serial.println("HTTP server started.");
}

void loop()
{
  // Reconnect to WiFi if connection is lost
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    setup_wifi();
  }

  last_target_data = "";
  if (ld2450.read() > 0)
  {
    if (ld2450.getTarget(0).valid == 0 && ld2450.getTarget(1).valid == 0 && ld2450.getTarget(2).valid == 0)
    {
      digitalWrite(ledPin, LOW);
      zone1 = false;
      zone2 = false;
      zone3 = false;
      for (int i = 0; i < ld2450.getSensorSupportedTargetCount(); i++)
      {
        StaticJsonDocument<128> doc;
        doc["id"] = i + 1;
        doc["x"] = 0;
        doc["y"] = 0;

        String jsonString;
        serializeJson(doc, jsonString);
        ws.textAll(jsonString); // Send to all connected WebSocket clients
        //delay(100);
      }
    }
    else
    {
      tempZone1 = false;
      tempZone2 = false;
      tempZone3 = false;

      digitalWrite(ledPin, HIGH);
      for (int i = 0; i < ld2450.getSensorSupportedTargetCount(); i++)
      {
        const LD2450::RadarTarget target = ld2450.getTarget(i);
        // Add target information to the string
        last_target_data += "TARGET ID=" + String(i + 1) + " X=" + String((0 - target.x)) + "mm, Y=" + String(target.y) + "mm, SPEED=" + String(target.speed) + "cm/s, RESOLUTION=" + String(target.resolution) + "mm, DISTANCE=" + String(target.distance) + "mm, VALID=" + String(target.valid) + "\n";
        // Send positions via WebSocket
        StaticJsonDocument<128> doc;
        doc["id"] = i + 1;
        doc["x"] = 0 - target.x;
        doc["y"] = target.y;

        String jsonString;
        serializeJson(doc, jsonString);
        if (ws.availableForWriteAll()) {
          ws.textAll(jsonString); // Send to all connected WebSocket clients
        }
        //delay(100);

        // Check if target is within any zone
        for (int j = 0; j < 3; j++)
        {
          if ((0 - target.x) >= zones[j].x1 && (0 - target.x) <= zones[j].x2 && target.y >= zones[j].y1 && target.y <= zones[j].y2)
          {
            Serial.println("TARGET ID=" + String(i + 1) + " is within ZONE " + String(j + 1));
            switch (j + 1)
            {
            case 1:
              tempZone1 = true;
              break;
            case 2:
              tempZone2 = true;
              break;
            case 3:
              tempZone3 = true;
              break;
            }
          }
        }
      }
      zone1 = tempZone1;
      zone2 = tempZone2;
      zone3 = tempZone3;

      Serial.println(last_target_data);
    }
  }
  else{ 
      Serial.println("No data received from sensor");
      Serial2.end();
      Serial.println("Serial2 closed");
      delay(1500);
      ld2450.setNumberOfTargets(3);
      ld2450.begin(Serial2, false);
      Serial.println("Serial2 opened");
      delay(1500);
  }

  ws.cleanupClients(); // Ensure WebSocket clients are handled
  
}
