#include <Arduino.h>
#include <LD2450.h>

const int ledPin = 2;

String last_target_data = "";

// SENSOR INSTANCE
LD2450 ld2450;

void setup()
{
    ld2450.setNumberOfTargets(3);
    // SERIAL FOR DEBUG MESSAGES
    Serial.begin(115200);
    // SETUP SENSOR USING HARDWARE SERIAL INTERFACE 2
    ld2450.begin(Serial2, false);

    pinMode(ledPin, OUTPUT);
    digitalWrite(ledPin, LOW);
}

void loop()
{
    last_target_data = "";
    if (ld2450.read() > 0)
    {
        if (ld2450.getTarget(0).valid == 0 && ld2450.getTarget(1).valid == 0 && ld2450.getTarget(2).valid == 0)
        {
            digitalWrite(ledPin, LOW);
        }
        else
        {
            digitalWrite(ledPin, HIGH);
            for (int i = 0; i < ld2450.getSensorSupportedTargetCount(); i++)
            {
                const LD2450::RadarTarget target = ld2450.getTarget(i);
                // Add target information to the string
                last_target_data += "TARGET ID=" + String(i + 1) + " X=" + String(target.x) + "mm, Y=" + String(target.y) + "mm, SPEED=" + String(target.speed) + "cm/s, RESOLUTION=" + String(target.resolution) + "mm, DISTANCE=" + String(target.distance) + "mm, VALID=" + String(target.valid) + "\n";
            }
            Serial.println(last_target_data);
        }
    }
}