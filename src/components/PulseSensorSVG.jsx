import React from "react";

/**
 * PulseSensorSVG
 * - Black sensor
 * - "Pulse Sensor" placed ABOVE the circular board (never clipped)
 * - Pins & labels outside
 */
export default function PulseSensorSVG({ width = 320, height = 330 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 360 330"
      role="img"
      aria-label="Pulse sensor module"
    >
      <defs>
        <linearGradient id="pcbGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#050607" />
          <stop offset="100%" stopColor="#111214" />
        </linearGradient>

        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="#0f1722" />
          <stop offset="60%" stopColor="#02121a" />
        </radialGradient>

        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.30" />
        </filter>
      </defs>

      {/* 🔵 LABEL ON TOP (CLEAR, NEVER CLIPPED) */}
      <text
        x="140"
        y="35"
        fontSize="22"
        fill="#111827"
        fontWeight="700"
        textAnchor="middle"
        style={{ letterSpacing: "0.5px" }}
      >
        Pulse Sensor
      </text>

      {/* PCB Circle */}
      <g filter="url(#shadow)">
        <circle cx="140" cy="160" r="110" fill="url(#pcbGrad)" stroke="#0c0f12" strokeWidth="4" />
      </g>

      {/* inner ring */}
      <circle cx="140" cy="160" r="75" fill="url(#centerGlow)" stroke="#0b1720" strokeWidth="2" />

      {/* center optic */}
      <circle cx="140" cy="160" r="26" fill="#000" stroke="#0ea5a1" strokeWidth="2" />

      {/* PIN SET */}
      {[
        { id: "VCC", y: 110, color: "#ef4444" },
        { id: "SIG", y: 160, color: "#8b5cf6" },
        { id: "GND", y: 210, color: "#111827" }
      ].map((p) => (
        <g
          key={p.id}
          transform={`translate(260, ${p.y})`}
          style={{ cursor: "pointer" }}
        >
          <circle cx="0" cy="0" r="18" fill="transparent" data-pin={p.id} />
          <circle
            cx="0"
            cy="0"
            r="12"
            fill={p.color}
            stroke="#fff"
            strokeWidth="1.5"
            data-pin={p.id}
          />
          <text
            x="28"
            y="4"
            fontSize="13"
            fill="#091521"
            fontWeight="700"
          >
            {p.id}
          </text>
        </g>
      ))}
    </svg>
  );
}
