"use client";

import { useEffect, useRef } from "react";

export default function StarsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const starCount = 150;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2.5 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      fragment.appendChild(star);
    }

    // Add shooting stars
    for (let i = 0; i < 2; i++) {
      const shooting = document.createElement("div");
      shooting.className = "shooting-star";
      shooting.style.top = `${Math.random() * 40}%`;
      shooting.style.left = `${Math.random() * 60 + 20}%`;
      shooting.style.animationDelay = `${i * 3 + Math.random() * 2}s`;
      fragment.appendChild(shooting);
    }

    container.appendChild(fragment);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="stars-container" />
      <div className="solar-system">
        <div className="sun" />
        <div className="orbit orbit-1" />
        <div className="orbit orbit-2" />
        <div className="orbit orbit-3" />
      </div>
    </>
  );
}