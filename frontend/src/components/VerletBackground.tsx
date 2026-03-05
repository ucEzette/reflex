"use client";

import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    z: number;
    ox: number;
    oy: number;
    oz: number;
    r: number;
    m: number;
}

interface Link {
    a: number;
    b: number;
    len: number;
    stiff: number;
}

export function VerletBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const rafRef = useRef<number>(0);

    // Track mouse globally via window events
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const onMove = (e: MouseEvent | TouchEvent) => {
            const pt = 'touches' in e ? e.touches[0] : e;
            if (!pt) return;
            mouseRef.current.x = pt.clientX;
            mouseRef.current.y = pt.clientY;
            mouseRef.current.active = true;

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                mouseRef.current.active = false;
            }, 150);
        };

        // Use capture phase to get events before anything else
        window.addEventListener('mousemove', onMove, { capture: true, passive: true });
        window.addEventListener('touchmove', onMove, { capture: true, passive: true });

        return () => {
            window.removeEventListener('mousemove', onMove, { capture: true } as EventListenerOptions);
            window.removeEventListener('touchmove', onMove, { capture: true } as EventListenerOptions);
            clearTimeout(timeout);
        };
    }, []);

    // Main canvas animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // --- Setup ---
        let W = 0;
        let H = 0;
        let dpr = 1;

        const resize = () => {
            dpr = window.devicePixelRatio || 1;
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
        };
        resize();
        window.addEventListener('resize', resize);

        // --- Particles ---
        const COUNT = 80;
        const particles: Particle[] = [];
        const links: Link[] = [];
        const FOV = 800;
        const FRICTION = 0.985;

        for (let i = 0; i < COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const rad = 200 + Math.random() * 200;

            const x = W / 2 + rad * Math.sin(phi) * Math.cos(theta);
            const y = H / 2 + rad * Math.sin(phi) * Math.sin(theta);
            const z = rad * Math.cos(phi);

            particles.push({
                x, y, z,
                ox: x, oy: y, oz: z,
                r: 2 + Math.random() * 3,
                m: 0.8 + Math.random() * 0.4,
            });
        }

        // Connect nearest neighbors
        for (let i = 0; i < COUNT; i++) {
            const dists: { idx: number; d: number }[] = [];
            for (let j = 0; j < COUNT; j++) {
                if (i === j) continue;
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dz = particles[i].z - particles[j].z;
                dists.push({ idx: j, d: Math.sqrt(dx * dx + dy * dy + dz * dz) });
            }
            dists.sort((a, b) => a.d - b.d);

            for (let k = 0; k < 3; k++) {
                const j = dists[k].idx;
                // Avoid duplicates
                if (!links.some(l => (l.a === i && l.b === j) || (l.a === j && l.b === i))) {
                    links.push({ a: i, b: j, len: dists[k].d, stiff: 0.015 });
                }
            }
        }

        // --- Animation Loop ---
        const animate = () => {
            // IMPORTANT: set transform fresh every frame to avoid scale compounding
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Clear
            ctx.fillStyle = '#0B0E14';
            ctx.fillRect(0, 0, W, H);

            const time = performance.now() * 0.0004;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const mActive = mouseRef.current.active;

            // 1. Verlet Integration
            for (let i = 0; i < COUNT; i++) {
                const p = particles[i];
                const vx = (p.x - p.ox) * FRICTION;
                const vy = (p.y - p.oy) * FRICTION;
                const vz = (p.z - p.oz) * FRICTION;

                p.ox = p.x;
                p.oy = p.y;
                p.oz = p.z;

                p.x += vx;
                p.y += vy;
                p.z += vz;

                // Ambient organic sway
                p.x += Math.sin(time + p.y * 0.008) * 0.6;
                p.y += Math.cos(time + p.x * 0.008) * 0.6;

                // Slow Y-axis rotation
                const cx = W / 2;
                const rx = p.x - cx;
                const rz = p.z;
                const ang = 0.0012;
                p.x = rx * Math.cos(ang) - rz * Math.sin(ang) + cx;
                p.z = rx * Math.sin(ang) + rz * Math.cos(ang);

                // Mouse interaction
                const scale = FOV / (FOV + p.z);
                const px = (p.x - W / 2) * scale + W / 2;
                const py = (p.y - H / 2) * scale + H / 2;
                const ddx = px - mx;
                const ddy = py - my;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);

                if (dist < 350) {
                    const force = (350 - dist) / 350;
                    if (mActive) {
                        // Repulsion
                        p.x += ddx * force * 0.18;
                        p.y += ddy * force * 0.18;
                    } else {
                        // Gentle attraction / parallax
                        p.x -= ddx * force * 0.025;
                        p.y -= ddy * force * 0.025;
                    }
                }
            }

            // 2. Constraint resolution
            for (let iter = 0; iter < 3; iter++) {
                for (let i = 0; i < links.length; i++) {
                    const l = links[i];
                    const pa = particles[l.a];
                    const pb = particles[l.b];
                    const dx = pa.x - pb.x;
                    const dy = pa.y - pb.y;
                    const dz = pa.z - pb.z;
                    const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
                    const diff = (l.len - d) / d * l.stiff;
                    const tmass = pa.m + pb.m;

                    const ox = dx * diff;
                    const oy = dy * diff;
                    const oz = dz * diff;

                    pa.x += ox * (pb.m / tmass);
                    pa.y += oy * (pb.m / tmass);
                    pa.z += oz * (pb.m / tmass);
                    pb.x -= ox * (pa.m / tmass);
                    pb.y -= oy * (pa.m / tmass);
                    pb.z -= oz * (pa.m / tmass);
                }
            }

            // 3. Render links (sorted by depth)
            const projected: { x1: number; y1: number; x2: number; y2: number; avgZ: number }[] = [];
            for (let i = 0; i < links.length; i++) {
                const pa = particles[links[i].a];
                const pb = particles[links[i].b];
                const s1 = FOV / (FOV + pa.z);
                const s2 = FOV / (FOV + pb.z);
                projected.push({
                    x1: (pa.x - W / 2) * s1 + W / 2,
                    y1: (pa.y - H / 2) * s1 + H / 2,
                    x2: (pb.x - W / 2) * s2 + W / 2,
                    y2: (pb.y - H / 2) * s2 + H / 2,
                    avgZ: (pa.z + pb.z) / 2,
                });
            }
            projected.sort((a, b) => b.avgZ - a.avgZ);

            ctx.lineCap = 'round';
            ctx.lineWidth = 1.2;

            for (let i = 0; i < projected.length; i++) {
                const l = projected[i];
                if (l.avgZ < -600) continue;
                const fade = Math.max(0, Math.min(1, 1 - (l.avgZ + 400) / 1200));
                if (fade <= 0) continue;

                const useCyan = Math.sin(l.avgZ * 0.012 + time) > 0;
                ctx.beginPath();
                ctx.moveTo(l.x1, l.y1);
                ctx.lineTo(l.x2, l.y2);
                ctx.strokeStyle = useCyan
                    ? `rgba(0, 240, 255, ${fade * 0.2})`
                    : `rgba(128, 0, 32, ${fade * 0.3})`;
                ctx.stroke();
            }

            // 4. Render glowing nodes
            for (let i = 0; i < COUNT; i++) {
                const p = particles[i];
                if (p.z > 250 || p.z < -350) continue;
                const scale = FOV / (FOV + p.z);
                const x = (p.x - W / 2) * scale + W / 2;
                const y = (p.y - H / 2) * scale + H / 2;
                const fade = Math.max(0, Math.min(1, 1 - (p.z + 400) / 1200));

                ctx.beginPath();
                ctx.arc(x, y, p.r * scale * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 240, 255, ${fade * 0.35})`;
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0"
            style={{ display: 'block', pointerEvents: 'none' }}
        />
    );
}
