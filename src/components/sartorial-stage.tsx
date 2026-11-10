"use client";

import { useReducedMotion } from "motion/react";
import { useState, type PointerEvent } from "react";

type SartorialStageProps = {
  src: string;
  alt: string;
  label: string;
};

export function SartorialStage({ src, alt, label }: SartorialStageProps) {
  const reduceMotion = useReducedMotion();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientY - bounds.top) / bounds.height - 0.5;
    const y = (event.clientX - bounds.left) / bounds.width - 0.5;
    setRotation({ x: -x * 5, y: y * 7 });
  }

  function resetRotation() {
    setRotation({ x: 0, y: 0 });
  }

  return (
    <div className="sartorial-stage-wrap">
      <div
        className="sartorial-stage"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetRotation}
        style={{ transform: `perspective(1300px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        <img className="sartorial-stage-image" src={src} alt={alt} />
        <div className="sartorial-stage-frame" aria-hidden="true" />
        <span className="sartorial-stage-label">{label}</span>
      </div>
    </div>
  );
}
