"use client";
import { useEffect, useRef } from "react";

// neural net background — atmospheric, never overpowering.
//
// design notes for readability:
//   - particle count saturates fast so the panel doesn't become a fishnet
//   - link opacity capped low so the web stays implication, not assertion
//   - radial fade-out from center: particles drawn dimmer toward the
//     middle of the panel where the text scrolls. you read clearly in
//     the center, the net comes alive at the edges.

export function ParticleMatrix({ intensity = 0 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    // clamp intensity so density saturates instead of running away.
    // at intensity >= 4, the visual already feels "fully assembled."
    const eff = Math.min(intensity, 5);
    const count = 35 + eff * 9;       // 35 → 80 across the whole arc
    const linkDist = 0.10 + eff * 0.008; // 0.10 → 0.14, never web-dense
    const lineAlpha = 0.04 + eff * 0.015; // 0.04 → 0.115, atmospheric

    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0005,
      vy: (Math.random() - 0.5) * 0.0005,
      r: Math.random() * 1.4 + 0.3,
    }));

    // per-particle dimming factor based on distance from center —
    // particles near the middle render at ~25% opacity, edge ones full.
    // means the text region stays readable without hiding the effect.
    function centerFade(x: number, y: number): number {
      const dx = x - 0.5;
      const dy = y - 0.5;
      const d = Math.hypot(dx, dy);
      // d in [0..~0.707]. easeOut: invisible at center, full past ~0.4
      return Math.min(1, Math.max(0.18, d * 2.2));
    }

    function tick() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // core pulse — kept very subtle, doesn't compete with text
      const cx = w / 2;
      const cy = h / 2;
      const coreR = (Math.min(w, h) / 7) * (1 + eff * 0.1);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      grad.addColorStop(0, `rgba(0,255,102,${0.025 + eff * 0.01})`);
      grad.addColorStop(1, "rgba(0,255,102,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // particles — dimmed toward center where text lives
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const fade = centerFade(p.x, p.y);
        ctx.fillStyle = `rgba(0,240,255,${0.55 * fade})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // links — also fade-dimmed, averaged from both endpoints
      ctx.lineWidth = 1 * dpr;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const fade = (centerFade(a.x, a.y) + centerFade(b.x, b.y)) / 2;
            // also taper opacity by distance — closer links read brighter
            const distAlpha = 1 - d / linkDist;
            ctx.strokeStyle = `rgba(0,255,102,${lineAlpha * fade * distAlpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
