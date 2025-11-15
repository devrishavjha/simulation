import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PulseSensorSVG from "./PulseSensorSVG";
import ArduinoSVG from "./ArduinoSVG";
import BatterySVG from "./BatterySVG";
import Wire from "./Wire";

/**
 * Updated PulseSensorSim with Battery + Back Button
 *
 * Circuit wiring:
 *  - Battery BAT+  -> Arduino VIN  (red)
 *  - Battery BAT-  -> Arduino GND  (black)
 *  - Sensor SIG    -> Arduino A0   (purple)  (signal)
 *  - Sensor VCC    -> Arduino VIN  (red)      (powered from battery)
 *
 * Implementation: compute locations of all data-pin elements (sensor, arduino, battery)
 * and render wires. Draggable components.
 */

export default function PulseSensorSim() {
  const containerRef = useRef(null);

  const sensorWrapRef = useRef(null);
  const arduinoWrapRef = useRef(null);
  const batteryWrapRef = useRef(null);

  const [sensorPins, setSensorPins] = useState([]); // VCC SIG GND
  const [arduinoPins, setArduinoPins] = useState([]); // VIN GND A0 ...
  const [batteryPins, setBatteryPins] = useState([]); // BAT+ BAT-

  function queryPins(wrapperEl, selectors) {
    if (!wrapperEl) return [];
    const svg = wrapperEl.querySelector("svg");
    if (!svg) return [];
    const out = [];
    selectors.forEach((id) => {
      const el = svg.querySelector(`[data-pin="${id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        out.push({ id, x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
    });
    return out;
  }

  function computeAllPins() {
    const s = queryPins(sensorWrapRef.current, ["VCC", "SIG", "GND"]);
    const a = queryPins(arduinoWrapRef.current, ["VIN", "GND", "A0", "A1", "A2", "A3"]);
    const b = queryPins(batteryWrapRef.current, ["BAT+", "BAT-"]);
    setSensorPins(s);
    setArduinoPins(a);
    setBatteryPins(b);
  }

  useEffect(() => {
    computeAllPins();
    window.addEventListener("resize", computeAllPins);
    window.addEventListener("scroll", computeAllPins);
    return () => {
      window.removeEventListener("resize", computeAllPins);
      window.removeEventListener("scroll", computeAllPins);
    };
  }, []);

  function onDragEndRecompute() {
    setTimeout(computeAllPins, 50);
  }

  const snapTargets = [...arduinoPins, ...batteryPins];

  function findPin(list, id) {
    return list.find((p) => p.id === id) || null;
  }

  const wires = [
    { key: "bat_to_vin", startPin: findPin(batteryPins, "BAT+"), pinnedTo: "VIN", color: "#ef4444", thickness: 12 },
    { key: "bat_to_gnd", startPin: findPin(batteryPins, "BAT-"), pinnedTo: "GND", color: "#111827", thickness: 12 },
    { key: "sig_to_a0", startPin: findPin(sensorPins, "SIG"), pinnedTo: "A0", color: "#8b5cf6", thickness: 11 },
    { key: "vcc_to_vin", startPin: findPin(sensorPins, "VCC"), pinnedTo: "VIN", color: "#ef4444", thickness: 11 },
    { key: "gnd_to_gnd", startPin: findPin(sensorPins, "GND"), pinnedTo: "GND", color: "#111827", thickness: 11 },
  ];

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-white p-6 relative">
      <h1 className="text-2xl font-semibold mb-4">
        IoT Circuit Simulator —{" "}
        <span className="text-sm font-bold">
          (built by Rishav Jha ) (for the purpose of minor project)
        </span>
      </h1>

      {/* Sensor left */}
      <motion.div
        ref={sensorWrapRef}
        drag
        dragMomentum={false}
        onDragEnd={onDragEndRecompute}
        style={{ position: "absolute", left: 48, top: 120, cursor: "grab" }}
      >
        <PulseSensorSVG width={320} height={330} />
      </motion.div>

      {/* Arduino right */}
      <motion.div
        ref={arduinoWrapRef}
        drag
        dragMomentum={false}
        onDragEnd={onDragEndRecompute}
        style={{ position: "absolute", right: 48, top: 120, cursor: "grab" }}
      >
        <ArduinoSVG width={460} height={300} />
      </motion.div>

      {/* Battery bottom-center */}
      <motion.div
        ref={batteryWrapRef}
        drag
        dragMomentum={false}
        onDragEnd={onDragEndRecompute}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 48,
          cursor: "grab",
        }}
      >
        <BatterySVG width={300} height={160} />
      </motion.div>

      {/* Render wires */}
      {wires.map((w) => {
        const start = w.startPin;
        const target = findPin(arduinoPins, w.pinnedTo) || findPin(batteryPins, w.pinnedTo);
        if (!start) return null;
        return (
          <Wire
            key={w.key}
            start={start}
            pins={snapTargets}
            initialEnd={target ? { x: target.x, y: target.y } : undefined}
            color={w.color}
            thickness={w.thickness}
            onAttach={() => setTimeout(computeAllPins, 40)}
          />
        );
      })}

      {/* small info card + Back button */}
      <div
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          background: "#fff",
          borderRadius: 10,
          padding: 12,
          boxShadow: "0 8px 26px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Circuit</div>
        <div style={{ fontSize: 13 }}>Battery+ → ESP32 VIN (red)</div>
        <div style={{ fontSize: 13 }}>Battery- → ESP32 GND (black)</div>
        <div style={{ fontSize: 13 }}>Sensor SIG → ESP32 A0 (purple)</div>
        <div style={{ fontSize: 13 }}>Sensor VCC → ESP32 VIN (red)</div>

        <button
          style={{
            marginTop: 8,
            background: "#0ea5a1",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            fontWeight: 700,
            cursor: "pointer",
          }}
          onClick={() => {
            window.location.href = "/"; // replace "/" with desired link
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
