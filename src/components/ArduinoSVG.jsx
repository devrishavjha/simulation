import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function ESP32PulseIDE({ width = 460, height = 300 }) {
  const [showIDE, setShowIDE] = useState(false);

  // Real ESP32/ESP8266 + Pulse Sensor code
  const esp32PulseCode = `#include <WiFi.h>
#include <HTTPClient.h>
#include <PulseSensorPlayground.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

const int pulsePin = 34; // ESP32 analog pin
PulseSensorPlayground pulseSensor;

const char* serverURL = "http://your-server.com/submit"; // Replace with your endpoint

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWi-Fi connected");

  pulseSensor.analogInput(pulsePin);
  pulseSensor.setThreshold(550);
  pulseSensor.begin();
}

void loop() {
  int bpm = pulseSensor.getBeatsPerMinute();

  if (pulseSensor.sawStartOfBeat()) {
    Serial.println(bpm);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverURL);
      http.addHeader("Content-Type", "application/x-www-form-urlencoded");
      String postData = "bpm=" + String(bpm);
      int httpResponseCode = http.POST(postData);

      if (httpResponseCode > 0) {
        Serial.println("Data sent: " + String(httpResponseCode));
      } else {
        Serial.println("Error sending data");
      }
      http.end();
    }
  }

  delay(20);
}`;

  useEffect(() => {
    if (showIDE) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showIDE]);

  const IDEOverlay = showIDE
    ? createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#0f172a",
            color: "#d1d5db",
            fontFamily: "monospace",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            userSelect: "text",
          }}
        >
          {/* IDE Header */}
          <div
            style={{
              background: "#1e293b",
              padding: "10px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700 }}>ESP32/ESP8266 IDE - Pulse Sensor</div>
            <button
              onClick={() => setShowIDE(false)}
              style={{
                background: "#0ea5a1",
                border: "none",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Back
            </button>
          </div>

          {/* Code editor */}
          <pre
            style={{
              padding: "20px",
              flexGrow: 1,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              fontSize: "16px",
            }}
          >
            {esp32PulseCode}
          </pre>
        </div>,
        document.body
      )
    : null;

  return (
    <div style={{ textAlign: "center" }}>
      {IDEOverlay}

      <svg
        width={width}
        height={height}
        viewBox="0 0 500 300"
        role="img"
        aria-label="ESP32/ESP8266 board"
      >
        <defs>
          <linearGradient id="boardGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#0d3f6f" />
            <stop offset="100%" stopColor="#082a4f" />
          </linearGradient>

          <filter id="boardShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.28" />
          </filter>
        </defs>

        <g filter="url(#boardShadow)">
          <rect x="18" y="14" rx="16" width="460" height="252" fill="url(#boardGrad)" stroke="#06305a" strokeWidth="4" />
        </g>

        {/* Power jack */}
        <rect x="36" y="110" width="44" height="38" rx="6" fill="#cbd5e1" stroke="#475569" />

        {/* ESP32 clickable */}
        <g style={{ cursor: "pointer" }} onClick={() => setShowIDE(true)}>
          <rect x="210" y="92" width="110" height="72" rx="6" fill="#0ea5a1" stroke="#29475f" />

          {/* Label the rectangle itself - perfectly centered */}
          <text
            x={210 + 110 / 2}  // center horizontally
            y={92 + 72 / 2}    // center vertically
            fontSize="18"
            fill="#ffffff"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
          >
            ESP32
          </text>

          {/* Show Code clickable text */}
          <text
            x={210 + 110 / 2}
            y={92 + 72 + 18} // below the rectangle
            fontSize="14"
            fill="#fff"
            fontWeight="700"
            textAnchor="middle"
            pointerEvents="none"
          >
            Show Code
          </text>
        </g>

        {/* Left analog pins */}
        {["VIN", "GND", "A0", "A1", "A2", "A3"].map((pin, i) => {
          const y = 60 + i * 32;
          return (
            <g key={pin} transform={`translate(140, ${y})`} style={{ cursor: "pointer" }}>
              <circle cx="30" cy="10" r="20" fill="transparent" data-pin={pin} />
              <rect
                data-pin={pin}
                x="20"
                y="0"
                width="20"
                height="20"
                rx="4"
                fill="#071226"
                stroke="#d8e6f3"
                strokeWidth="2"
              />
              <text x="-10" y="14" fontSize="14" textAnchor="end" fill="#e9f4ff" fontWeight="700">
                {pin}
              </text>
            </g>
          );
        })}

        {/* Right digital header */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={380} y={60 + i * 26} width="20" height="20" rx="4" fill="#071226" stroke="#e3eefc" />
        ))}

        {/* Mount holes */}
        <circle cx="34" cy="28" r="6" fill="#000" opacity="0.18" />
        <circle cx="466" cy="266" r="6" fill="#000" opacity="0.18" />
      </svg>
    </div>
  );
}
