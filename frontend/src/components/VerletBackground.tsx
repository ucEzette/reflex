"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from "next-themes";

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

interface Cloud {
    x: number;
    y: number;
    scale: number;
    opacity: number;
    speed: number;
}

export function VerletBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const rafRef = useRef<number>(0);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        if (!mounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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
        const FOV = 800;
        const FRICTION = 0.99;

        for (let i = 0; i < COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const rad = 250 + Math.random() * 300;

            const x = W / 2 + rad * Math.sin(phi) * Math.cos(theta);
            const y = H / 2 + rad * Math.sin(phi) * Math.sin(theta);
            const z = rad * Math.cos(phi);

            particles.push({
                x, y, z,
                ox: x, oy: y, oz: z,
                r: 1 + Math.random() * 2,
                m: 0.8 + Math.random() * 0.4,
            });
        }

        // --- Clouds (for Light Mode) ---
        const clouds: Cloud[] = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * W,
                y: Math.random() * (H * 0.4),
                scale: 0.8 + Math.random() * 1.5,
                opacity: 0.3 + Math.random() * 0.5,
                speed: 0.2 + Math.random() * 0.3
            });
        }

        const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            
            // Draw fluffy cloud with simple circles
            const circles = [
                {x: 0, y: 0, r: 40},
                {x: 30, y: -10, r: 45},
                {x: 60, y: 0, r: 40},
                {x: 80, y: 15, r: 35},
                {x: -20, y: 15, r: 35},
                {x: 30, y: 20, r: 40}
            ];

            circles.forEach(c => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        };

        // --- Animation Loop ---
        const animate = () => {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const isLight = resolvedTheme === 'light';

            if (isLight) {
                // Bright Sky Gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, H);
                gradient.addColorStop(0, '#72c1e0');
                gradient.addColorStop(1, '#ffffff');
                ctx.fillStyle = gradient;
            } else {
                // Deep Space
                ctx.fillStyle = '#06080C';
            }
            ctx.fillRect(0, 0, W, H);

            if (isLight) {
                // Render Clouds
                clouds.forEach(cloud => {
                    drawCloud(ctx, cloud.x, cloud.y, cloud.scale, cloud.opacity);
                    cloud.x += cloud.speed;
                    if (cloud.x > W + 200) cloud.x = -200;
                });
            }

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

                p.x += Math.sin(time + p.y * 0.008) * 0.6;
                p.y += Math.cos(time + p.x * 0.008) * 0.6;

                const cx = W / 2;
                const rx = p.x - cx;
                const rz = p.z;
                const ang = 0.0008;
                p.x = rx * Math.cos(ang) - rz * Math.sin(ang) + cx;
                p.z = rx * Math.sin(ang) + rz * Math.cos(ang);

                const scale = FOV / (FOV + p.z);
                const px = (p.x - W / 2) * scale + W / 2;
                const py = (p.y - H / 2) * scale + H / 2;
                const ddx = px - mx;
                const ddy = py - my;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);

                if (dist < 350) {
                    const force = (350 - dist) / 350;
                    if (mActive) {
                        p.x += ddx * force * 0.18;
                        p.y += ddy * force * 0.18;
                    } else {
                        p.x -= ddx * force * 0.025;
                        p.y -= ddy * force * 0.025;
                    }
                }
            }

            // 2. Render stars/dust (only in dark mode or very subtle in light)
            if (!isLight) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                for (let i = 0; i < 150; i++) {
                    const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * W;
                    const y = (Math.cos(i * 654.321) * 0.5 + 0.5) * H;
                    ctx.fillRect(x, y, 1, 1);
                }
            } else {
                // Subtle "sunlight" particles
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                for (let i = 0; i < 50; i++) {
                    const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * W;
                    const y = (Math.cos(i * 654.321) * 0.5 + 0.5) * H;
                    ctx.fillRect(x, y, 2, 2);
                }
            }

            // 4. Render glowing nodes
            for (let i = 0; i < COUNT; i++) {
                const p = particles[i];
                if (p.z > 400 || p.z < -500) continue;
                const scale = FOV / (FOV + p.z);
                const x = (p.x - W / 2) * scale + W / 2;
                const y = (p.y - H / 2) * scale + H / 2;
                const fade = Math.max(0, Math.min(1, 1 - (p.z + 500) / 1000));

                const colorShift = Math.sin(time + i) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(x, y, p.r * scale * 1.5, 0, Math.PI * 2);
                
                if (isLight) {
                    ctx.fillStyle = colorShift > 0.5
                        ? `rgba(0, 174, 239, ${fade * 0.3})`
                        : `rgba(255, 255, 255, ${fade * 0.8})`;
                } else {
                    ctx.fillStyle = colorShift > 0.5
                        ? `rgba(0, 240, 255, ${fade * 0.4})`
                        : `rgba(255, 255, 255, ${fade * 0.6})`;
                }
                ctx.fill();

                if (fade > 0.5) {
                    ctx.beginPath();
                    ctx.arc(x, y, p.r * scale * 4, 0, Math.PI * 2);
                    ctx.fillStyle = isLight 
                        ? `rgba(0, 174, 239, ${fade * 0.05})`
                        : `rgba(0, 240, 255, ${fade * 0.05})`;
                    ctx.fill();
                }
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafRef.current);
        };
    }, [mounted, resolvedTheme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0"
            style={{ display: 'block', pointerEvents: 'none' }}
        />
    );
}
