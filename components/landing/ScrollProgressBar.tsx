"use client";

import { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2.5px] pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,43,43,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

