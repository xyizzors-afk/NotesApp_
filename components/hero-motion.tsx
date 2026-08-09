"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function HeroMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
}
