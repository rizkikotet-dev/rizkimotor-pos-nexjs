"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 500,
  direction = "up",
  distance = 20,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dirMap = {
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`,
      none: "none",
    };

    el.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`;
    el.style.transform = dirMap[direction];
    el.style.opacity = "0";

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration, direction, distance]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isVisible) {
      el.style.opacity = "1";
      el.style.transform = "none";
    } else {
      const dirMap = {
        up: `translateY(${distance}px)`,
        down: `translateY(-${distance}px)`,
        left: `translateX(${distance}px)`,
        right: `translateX(-${distance}px)`,
        none: "none",
      };
      el.style.opacity = "0";
      el.style.transform = dirMap[direction];
    }
  }, [isVisible, direction, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
