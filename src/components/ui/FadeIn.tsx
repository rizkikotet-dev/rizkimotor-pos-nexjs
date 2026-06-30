/**
 * FadeIn — CSS-only scroll animation, zero JS.
 *
 * Gunakan CSS @keyframes fade-in + animation-delay via inline style.
 * Tidak perlu IntersectionObserver, useEffect, atau 'use client'.
 *
 * Animasi langsung play di mount (bukan saat scroll). Cocok untuk page
 * transitions dan staggered appearance. Untuk scroll-triggered animations
 * di masa depan, tambah IntersectionObserver terpisah via hook.
 */
import { type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "none";
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 400,
  direction = "up",
}: FadeInProps) {
  const animName = direction === "none" ? "fade-in" : "fade-in";

  return (
    <div
      className={className}
      style={{
        animation: `${animName} ${duration}ms ease-out ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}
