"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type MotionLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
};

export function MotionLink({ href, className, children }: MotionLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="motion-link-wrap"
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <Link href={href} className={className}>{children}</Link>
    </motion.div>
  );
}
