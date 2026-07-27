"use client";

import { useRef, useEffect, useState } from "react";

interface MapViewProps {
  lat: number;
  lon: number;
  city: string;
}

export default function MapView({ lat, lon, city }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = rect.width || 640;
    const displayHeight = Math.round(displayWidth * 0.45);

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    // Dark background
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Load OSM tile
    const zoom = 12;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://tile.openstreetmap.org/${zoom}/${Math.floor(lon2tile(lon, zoom))}/${Math.floor(lat2tile(lat, zoom))}.png`;

  let animationFrameId: number;
  let startTime = performance.now();

  function renderFrame() {
      if (!ctx || !canvas) return;
      const elapsed = (performance.now() - startTime) / 1000;

      // Re-draw base
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      ctx.globalAlpha = 0.35;
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      ctx.globalAlpha = 1;

      drawRoadOverlay(ctx, displayWidth, displayHeight, lat, lon);

      // Animate the pulsing marker
      drawNeonOrangeMarker(ctx, displayWidth, displayHeight, city, elapsed);

      animationFrameId = requestAnimationFrame(renderFrame);
  }

  img.onload = () => {
      startTime = performance.now();
      renderFrame();
      setLoaded(true);
    };

  img.onerror = () => {
      drawRoadOverlay(ctx, displayWidth, displayHeight, lat, lon);
      drawNeonOrangeMarker(ctx, displayWidth, displayHeight, city, 0);
      setError(true);
    };

    const handleResize = () => {
      const newRect = container.getBoundingClientRect();
      if (Math.abs(newRect.width - displayWidth) > 10) {
        // Re-render on significant resize
        // For simplicity, we skip re-render but the canvas would need it
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [lat, lon, city]);

  return (
    <div ref={containerRef} className="relative w-full map-fade-edges" style={{ minHeight: "120px" }}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ aspectRatio: "20/9", display: "block" }}
      />
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#050510" }}>
          <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function drawRoadOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lat: number,
  lon: number
) {
  const cx = w / 2;
  const cy = h * 0.48;

  // ── Bright white roads radiating from center ──
  const roadCount = 14;
  for (let i = 0; i < roadCount; i++) {
    const angle = (i / roadCount) * Math.PI * 2 + Math.sin(i * 1.3) * 0.4;
    const len = w * 0.2 + Math.sin(i * 2.7) * w * 0.1 + w * 0.15;
    const brightness = 0.5 + Math.sin(i * 1.1) * 0.2;

    // Road shadow (glow)
    ctx.strokeStyle = `rgba(255, 180, 80, ${brightness * 0.12})`;
    ctx.lineWidth = 6 + Math.sin(i * 2.3) * 2;
    ctx.beginPath();
    let sx = cx, sy = cy;
    for (let step = 0; step <= 1; step += 0.04) {
      const wobX = Math.sin(step * 12 + i * 1.7) * (6 + step * 4);
      const wobY = Math.cos(step * 10 + i * 2.3) * (4 + step * 3);
      sx = cx + Math.cos(angle) * len * step + wobX;
      sy = cy + Math.sin(angle) * len * step * 0.85 + wobY;
      if (step === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Road core (white)
    ctx.strokeStyle = `rgba(255, 210, 150, ${brightness * 0.5})`;
    ctx.lineWidth = 2 + Math.sin(i * 2.3) * 0.5;
    ctx.beginPath();
    sx = cx; sy = cy;
    for (let step = 0; step <= 1; step += 0.04) {
      const wobX = Math.sin(step * 12 + i * 1.7) * (6 + step * 4);
      const wobY = Math.cos(step * 10 + i * 2.3) * (4 + step * 3);
      sx = cx + Math.cos(angle) * len * step + wobX;
      sy = cy + Math.sin(angle) * len * step * 0.85 + wobY;
      if (step === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // ── Secondary smaller roads ──
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 + Math.sin(i * 0.9) * 0.6;
    const len = w * 0.1 + Math.random() * w * 0.25;
    ctx.strokeStyle = `rgba(255, 190, 120, ${0.15 + Math.random() * 0.15})`;
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    let sx = cx, sy = cy;
    for (let step = 0; step <= 1; step += 0.05) {
      const wobX = Math.sin(step * 18 + i * 2.1) * (8 + step * 6);
      const wobY = Math.cos(step * 14 + i * 3.7) * (6 + step * 4);
      sx = cx + Math.cos(angle) * len * step + wobX;
      sy = cy + Math.sin(angle) * len * step * 0.85 + wobY;
      if (step === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // ── Faint grid lines ──
  ctx.strokeStyle = "rgba(140, 100, 60, 0.08)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += w / 16) {
    ctx.beginPath();
    for (let y = 0; y <= h; y += 4) {
      const wob = Math.sin(y * 0.08 + x * 0.03) * 1;
      if (y === 0) ctx.moveTo(x + wob, y);
      else ctx.lineTo(x + wob, y);
    }
    ctx.stroke();
  }
  for (let y = 0; y < h; y += h / 12) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const wob = Math.sin(x * 0.08 + y * 0.03) * 1;
      if (x === 0) ctx.moveTo(x, y + wob);
      else ctx.lineTo(x, y + wob);
    }
    ctx.stroke();
  }

  // ── Concentric pulsing rings ──
  for (let r = 25; r < 120; r += 28) {
    ctx.strokeStyle = `rgba(255, 150, 50, ${0.04 + r / 500})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.02) {
      const wob = Math.sin(a * 8) * 2;
      const px = cx + Math.cos(a) * (r * 0.5 + wob);
      const py = cy + Math.sin(a) * (r * 0.38 + wob);
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function drawNeonOrangeMarker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  city: string,
  time: number = 0
) {
  const cx = w / 2;
  const cy = h * 0.48;

  // Slow blink: 2s cycle (1s up, 1s down)
  const pulse = Math.sin(time * Math.PI * 0.5) * 0.5 + 0.5; // 0 → 1 → 0 over 2 seconds
  const scale = 0.7 + pulse * 0.3; // 0.7 → 1.0 → 0.7

  // ── Outermost soft glow ──
  const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55 * scale);
  outerGlow.addColorStop(0, `rgba(255, 130, 0, ${0.2 * pulse})`);
  outerGlow.addColorStop(0.4, `rgba(255, 130, 0, ${0.08 * pulse})`);
  outerGlow.addColorStop(1, "rgba(255, 130, 0, 0)");
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 55 * scale, 0, Math.PI * 2);
  ctx.fill();

  // ── Mid glow ring ──
  const midGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * scale);
  midGlow.addColorStop(0, `rgba(255, 140, 10, ${0.35 * pulse})`);
  midGlow.addColorStop(0.6, `rgba(255, 140, 10, ${0.1 * pulse})`);
  midGlow.addColorStop(1, "rgba(255, 140, 10, 0)");
  ctx.fillStyle = midGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 30 * scale, 0, Math.PI * 2);
  ctx.fill();

  // ── Neon orange dot with glow ──
  ctx.save();
  ctx.shadowColor = `rgba(255, 130, 0, ${0.9 * pulse})`;
  ctx.shadowBlur = 15 + pulse * 15;
  ctx.fillStyle = "#ff8200";
  ctx.beginPath();
  ctx.arc(cx, cy, 6 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // ── Brighter inner core ──
  ctx.fillStyle = "#ffa533";
  ctx.beginPath();
  ctx.arc(cx, cy, 3 + pulse * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // ── White hot center ──
  ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5 + pulse * 1, 0, Math.PI * 2);
  ctx.fill();

  // ── City label below ──
  ctx.fillStyle = `rgba(255, 200, 150, ${0.4 + pulse * 0.3})`;
  ctx.font = "11px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(city, cx, cy + 28);
}

function lon2tile(lon: number, zoom: number) {
  return ((lon + 180) / 360) * Math.pow(2, zoom);
}

function lat2tile(lat: number, zoom: number) {
  return (
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    Math.pow(2, zoom)
  );
}