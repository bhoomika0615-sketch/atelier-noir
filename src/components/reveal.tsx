"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion || isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
