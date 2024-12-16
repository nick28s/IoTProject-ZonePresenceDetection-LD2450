#include <Arduino.h>
#include <LD2450.h>
#include <WiFi.h>


const int ledPin = 2;

String last_target_data = "";

// SENSOR INSTANCE
LD2450 ld2450;

boolean zone1, zone2, zone3;

// Define zones as rectangles with (x1, y1)LeftDownCorner and (x2, y2)RightUpCorner
struct Zone {
    int x1, y1, x2, y2;
};

Zone zones[3] = {
    {1, 1, 4000, 4000},   // Zone 1
    {-4000, 1, -1, 4000}, // Zone 2
    {-4001, 4001, 4001, 8000}  // Zone 3
};

bool tempZone1=false;
bool tempZone2=false;
bool tempZone3=false;

const char* ssid = "";
const char* password = "";

WiFiClient espClient;


void setup_wifi() {
  delay(10);
  //connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}



void setup() {
  // Initialize serial and wait for port to open:
  Serial.begin(115200);
  // This delay gives the chance to wait for a Serial Monitor without blocking if none is found
  delay(1500);
  ld2450.setNumberOfTargets(3);
  // SETUP SENSOR USING HARDWARE SERIAL INTERFACE 2
  ld2450.begin(Serial2, false);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  zone1=false;
  zone2=false;
  zone3=false;

  setup_wifi();

}

void loop() {
  // Your code here 
  last_target_data = "";
  if (ld2450.read() > 0)
  {
      if (ld2450.getTarget(0).valid == 0 && ld2450.getTarget(1).valid == 0 && ld2450.getTarget(2).valid == 0)
      {
          digitalWrite(ledPin, LOW);
          zone1=false;
          zone2=false;
          zone3=false;
      }
      else
      {
          tempZone1=false;
          tempZone2=false;
          tempZone3=false;
        
          digitalWrite(ledPin, HIGH);
          for (int i = 0; i < ld2450.getSensorSupportedTargetCount(); i++)
          {
              const LD2450::RadarTarget target = ld2450.getTarget(i);
              // Add target information to the string
              last_target_data += "TARGET ID=" + String(i + 1) + " X=" + String((0-target.x)) + "mm, Y=" + String(target.y) + "mm, SPEED=" + String(target.speed) + "cm/s, RESOLUTION=" + String(target.resolution) + "mm, DISTANCE=" + String(target.distance) + "mm, VALID=" + String(target.valid) + "\n";
              
              
            
              // Check if target is within any zone
              for (int j = 0; j < 3; j++)
              {
                  if ((0-target.x) >= zones[j].x1 && (0-target.x) <= zones[j].x2 && target.y >= zones[j].y1 && target.y <= zones[j].y2)
                  {
                      Serial.println("TARGET ID=" + String(i + 1) + " is within ZONE " + String(j + 1));
                      switch(j+1)
                      {
                        case 1: tempZone1 = true;
                                break;
                        case 2: tempZone2 = true; 
                                break;
                        case 3: tempZone3 = true;
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

}








