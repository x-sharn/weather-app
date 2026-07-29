"use client";

import { useEffect, useRef } from "react";

export default function StarsBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create stars
    const starCount = 150;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
      stars.push(star);
    }

    // Create shooting stars
    for (let i = 0; i < 3; i++) {
      const shootingStar = document.createElement("div");
      shootingStar.className = "shooting-star";
      shootingStar.style.left = `${Math.random() * 100}%`;
      shootingStar.style.top = `${Math.random() * 50}%`;
      shootingStar.style.animationDelay = `${Math.random() * 10 + 5}s`;
      container.appendChild(shootingStar);
      stars.push(shootingStar);
    }

    return () => {
      stars.forEach((star) => star.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className="stars-container" />
  );
}