import React, { useEffect, useRef, useState } from "react";
import { motion, animate } from "framer-motion";

/**
 * Wire.jsx
 *
 * Props:
 *  - start: { x, y }   (absolute page coords)
 *  - pins: [{ id, x, y }]  (targets)
 *  - initialEnd: { x, y }
 *  - color: CSS color
 *  - thickness: number
 *  - onAttach(pinId) callback
 *
 * Behavior:
 *  - Draggable knob is glued to the visible wire end.
 *  - When knob is within snap radius of a pin, it snaps and stays there.
 *  - Knob remains visible above Arduino (no hide).
 *  - User can drag knob away to detach (if moved outside snap radius on drag end).
 */
export default function Wire({
  start,
  pins = [],
  initialEnd,
  color = "#ef4444",
  thickness = 10,
  onAttach = () => {},
}) {
  const [end, setEnd] = useState(initialEnd || { x: start.x + 120, y: start.y });
  const [attachedPin, setAttachedPin] = useState(null);
  const knobRef = useRef(null);

  useEffect(() => {
    if (initialEnd) setEnd(initialEnd);
  }, [initialEnd]);

  // build semi-rigid cubic bezier
  function buildPath(s, e) {
    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const dist = Math.hypot(dx, dy);
    const cStrength = Math.max(40, Math.min(120, dist / 3));
    const cx1 = s.x + dx * 0.28;
    const cy1 = s.y + dy * 0.28 - cStrength;
    const cx2 = s.x + dx * 0.72;
    const cy2 = s.y + dy * 0.72 - cStrength * 0.6;
    return `M ${s.x},${s.y} C ${cx1},${cy1} ${cx2},${cy2} ${e.x},${e.y}`;
  }

  function nearestPin(point) {
    let best = null;
    let bestD = Infinity;
    for (const p of pins) {
      const d = Math.hypot(p.x - point.x, p.y - point.y);
      if (d < bestD) {
        bestD = d;
        best = { pin: p, dist: d };
      }
    }
    return best;
  }

  // snap radius
  const SNAP_RADIUS = 36;

  // We control end position: if attachedPin exists, keep end at the pin coords
  useEffect(() => {
    if (attachedPin) {
      // find pin coords in pins list
      const p = pins.find((x) => x.id === attachedPin);
      if (p) {
        setEnd({ x: p.x, y: p.y });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachedPin, pins]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 40 }}>
      <svg style={{ width: "100%", height: "100%", overflow: "visible" }}>
        {/* main thicker stroke for PVC body */}
        <path
          d={buildPath(start, end)}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }}
        />
        {/* glossy highlight — thinner semi-transparent stroke */}
        <path
          d={buildPath(start, end)}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={Math.max(2, thickness / 3)}
          strokeLinecap="round"
          style={{ mixBlendMode: "screen", pointerEvents: "none" }}
        />
      </svg>

      {/* draggable knob (the visible dot at wire end). pointerEvents auto so it can be dragged */}
      <motion.div
        ref={knobRef}
        drag
        dragMomentum={false}
        dragConstraints={{ left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }}
        style={{
          position: "absolute",
          left: end.x - 10,
          top: end.y - 10,
          width: 20,
          height: 20,
          pointerEvents: "auto",
          zIndex: 999, // on top of board
        }}
        onDrag={(e, info) => {
          // live update end while dragging
          setEnd({ x: info.point.x, y: info.point.y });
        }}
        onDragEnd={(e, info) => {
          const p = nearestPin({ x: info.point.x, y: info.point.y });
          if (p && p.dist <= SNAP_RADIUS) {
            // animate to snap
            const from = { x: info.point.x, y: info.point.y };
            const to = { x: p.pin.x, y: p.pin.y };
            animate(from, to, {
              duration: 0.16,
              onUpdate(v) {
                setEnd({ x: v.x, y: v.y });
              },
              onComplete() {
                setAttachedPin(p.pin.id);
                onAttach(p.pin.id);
              },
            });
          } else {
            // detach
            setAttachedPin(null);
            onAttach(null);
            setEnd({ x: info.point.x, y: info.point.y });
          }
        }}
        onDoubleClick={() => {
          // double click detaches
          setAttachedPin(null);
          onAttach(null);
        }}
      >
        {/* knob visual: PVC insulated circle with inner metal-ish core */}
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.35)",
          transform: "translateZ(0)",
        }}>
          {/* outer insulated circle */}
          <div style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: color,
            border: "2px solid rgba(255,255,255,0.6)",
            boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* small inner metal tip */}
            <div style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              background: "#f3f4f6",
              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
