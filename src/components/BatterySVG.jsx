import React from "react";

export default function BatteryRealAA({ width = 500, height = 200 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 520 200"
      role="img"
      aria-label="Realistic AA battery pack"
    >
      <defs>
        {/* Black holder */}
        <linearGradient id="holderBlack" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#222" />
          <stop offset="60%" stopColor="#111" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>

        {/* Battery purple gradient */}
        <linearGradient id="cylBody" x1="0" x2="1">
          <stop offset="0%" stopColor="#b388ff" />
          <stop offset="20%" stopColor="#d6baff" />
          <stop offset="50%" stopColor="#c9a7ff" />
          <stop offset="80%" stopColor="#d6baff" />
          <stop offset="100%" stopColor="#a67fff" />
        </linearGradient>

        <radialGradient id="capMetal">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#c7c7c7" />
          <stop offset="100%" stopColor="#9e9e9e" />
        </radialGradient>

        <filter id="shadowAA">
          <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* HOLDER snug to batteries */}
      <g filter="url(#shadowAA)">
        <rect x="40" y="55" width="440" height="90" rx="18" fill="url(#holderBlack)" />
        <rect x="50" y="65" width="420" height="70" rx="14" stroke="#333" strokeWidth="3" fill="none" />
      </g>

      {/* REAL CYLINDRICAL AA BATTERIES (horizontal, parallel) */}
      {[0, 1].map((i) => {
        const x = 60;
        const y = 60 + i * 45; // stacked parallel

        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            {/* Shadow under battery */}
            <ellipse cx="120" cy="28" rx="110" ry="12" fill="#000" opacity="0.25" />

            {/* BODY */}
            <rect
              x="20"
              y="4"
              width="200"
              height="40"
              rx="20"
              fill="url(#cylBody)"
              stroke="#8e6fff"
              strokeWidth="1.5"
            />

            {/* LEFT METAL CAP */}
            <ellipse cx="20" cy="24" rx="20" ry="20" fill="url(#capMetal)" />

            {/* RIGHT METAL CAP */}
            <ellipse cx="220" cy="24" rx="20" ry="20" fill="url(#capMetal)" />

            {/* Highlight glossy strip */}
            <rect x="60" y="8" width="16" height="32" rx="8" fill="rgba(255,255,255,0.3)" />
          </g>
        );
      })}

      {/* + terminal node (inside holder) */}
      <g transform="translate(40, 95)">
        <circle cx="0" cy="0" r="14" fill="#ef4444" stroke="#fff" strokeWidth="2" data-pin="BAT+" />
        <text x="28" y="5" fontSize="16" fill="#eee" fontWeight="700">
          BAT+
        </text>
      </g>

      {/* - terminal node (inside holder) */}
      <g transform="translate(480, 95)">
        <circle cx="0" cy="0" r="14" fill="#222" stroke="#fff" strokeWidth="2" data-pin="BAT-" />
        <text x="-25" y="5" fontSize="16" fill="#eee" fontWeight="700" textAnchor="end">
          BAT-
        </text>
      </g>
    </svg>
  );
}
