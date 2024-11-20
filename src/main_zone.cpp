// #include <Arduino.h>
// #include <LD2450.h>

// const int ledPin = 2;

// String last_target_data = "";

// // SENSOR INSTANCE
// LD2450 ld2450;

// // Define zones as rectangles with (x1, y1) and (x2, y2)
// struct Zone {
//     int x1, y1, x2, y2;
// };

// Zone zones[3] = {
//     {0, 0, 100, 100},   // Zone 1
//     {100, 100, 200, 200}, // Zone 2
//     {200, 200, 300, 300}  // Zone 3
// };

// void setup()
// {
//     ld2450.setNumberOfTargets(3);
//     // SERIAL FOR DEBUG MESSAGES
//     Serial.begin(115200);
//     // SETUP SENSOR USING HARDWARE SERIAL INTERFACE 2
//     ld2450.begin(Serial2, false);

//     pinMode(ledPin, OUTPUT);
//     digitalWrite(ledPin, LOW);
// }

// void loop()
// {
//     last_target_data = "";
//     if (ld2450.read() > 0)
//     {
//         if (ld2450.getTarget(0).valid == 0 && ld2450.getTarget(1).valid == 0 && ld2450.getTarget(2).valid == 0)
//         {
//             digitalWrite(ledPin, LOW);
//         }
//         else
//         {
//             digitalWrite(ledPin, HIGH);
//             for (int i = 0; i < ld2450.getSensorSupportedTargetCount(); i++)
//             {
//                 const LD2450::RadarTarget target = ld2450.getTarget(i);
//                 // Add target information to the string
//                 last_target_data += "TARGET ID=" + String(i + 1) + " X=" + String(target.x) + "mm, Y=" + String(target.y) + "mm, SPEED=" + String(target.speed) + "cm/s, RESOLUTION=" + String(target.resolution) + "mm, DISTANCE=" + String(target.distance) + "mm, VALID=" + String(target.valid) + "\n";

//                 // Check if target is within any zone
//                 for (int j = 0; j < 3; j++)
//                 {
//                     if (target.x >= zones[j].x1 && target.x <= zones[j].x2 && target.y >= zones[j].y1 && target.y <= zones[j].y2)
//                     {
//                         Serial.println("TARGET ID=" + String(i + 1) + " is within ZONE " + String(j + 1));
//                     }
//                 }
//             }
//             Serial.println(last_target_data);
//         }
//     }
// }