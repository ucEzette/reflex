"use client";

import React, { useEffect, useRef, useState } from 'react';

class Point {
    x: number;
    y: number;
    oldx: number;
    oldy: number;
    basex: number;
    basey: number;
    u: number;
    v: number;
    pinned: boolean;

    constructor(x: number, y: number, u: number, v: number, pinned: boolean = false) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.basex = x;
        this.basey = y;
        this.u = u;
        this.v = v;
        this.pinned = pinned;
    }
}

class Stick {
    p1: Point;
    p2: Point;
    length: number;

    constructor(p1: Point, p2: Point) {
        this.p1 = p1;
        this.p2 = p2;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        this.length = Math.sqrt(dx * dx + dy * dy);
    }
}

function drawTexturedTriangle(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    p0: Point, p1: Point, p2: Point
) {
    // Calculate centroid
    const cx = (p0.x + p1.x + p2.x) / 3;
    const cy = (p0.y + p1.y + p2.y) / 3;

    // Amount to push out vertices to hide seams (in pixels)
    const pad = 1.0;

    const d0 = Math.max(1, Math.sqrt((p0.x - cx) ** 2 + (p0.y - cy) ** 2));
    const ex0 = p0.x + ((p0.x - cx) / d0) * pad;
    const ey0 = p0.y + ((p0.y - cy) / d0) * pad;

    const d1 = Math.max(1, Math.sqrt((p1.x - cx) ** 2 + (p1.y - cy) ** 2));
    const ex1 = p1.x + ((p1.x - cx) / d1) * pad;
    const ey1 = p1.y + ((p1.y - cy) / d1) * pad;

    const d2 = Math.max(1, Math.sqrt((p2.x - cx) ** 2 + (p2.y - cy) ** 2));
    const ex2 = p2.x + ((p2.x - cx) / d2) * pad;
    const ey2 = p2.y + ((p2.y - cy) / d2) * pad;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ex0, ey0);
    ctx.lineTo(ex1, ey1);
    ctx.lineTo(ex2, ey2);
    ctx.closePath();
    ctx.clip();

    const u0 = p0.u, v0 = p0.v, x0 = p0.x, y0 = p0.y;
    const u1 = p1.u, v1 = p1.v, x1 = p1.x, y1 = p1.y;
    const u2 = p2.u, v2 = p2.v, x2 = p2.x, y2 = p2.y;

    const det = (u0 - u2) * (v1 - v2) - (u1 - u2) * (v0 - v2);
    if (Math.abs(det) < 0.0001) {
        ctx.restore();
        return;
    }

    const a = ((x0 - x2) * (v1 - v2) - (x1 - x2) * (v0 - v2)) / det;
    const c = ((u0 - u2) * (x1 - x2) - (u1 - u2) * (x0 - x2)) / det;
    const e = x0 - a * u0 - c * v0;

    const b = ((y0 - y2) * (v1 - v2) - (y1 - y2) * (v0 - v2)) / det;
    const d = ((u0 - u2) * (y1 - y2) - (u1 - u2) * (y0 - y2)) / det;
    const f = y0 - b * u0 - d * v0;

    // Apply a slight scaling hack to fix sub-pixel seam tearing between clipped triangles
    ctx.transform(a, b, c, d, e, f);

    // Draw the image onto the transformed context
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

interface VerletPlaneProps {
    src: string;
    cols?: number;
    rows?: number;
    stiffness?: number;
}

export function VerletPlane({ src, cols = 15, rows = 15, stiffness = 0.9 }: VerletPlaneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);

    const engineRef = useRef<{
        points: Point[];
        sticks: Stick[];
        triangles: [number, number, number][];
        img: HTMLImageElement | null;
        mouse: { x: number; y: number; active: boolean; dx: number; dy: number; lastX: number; lastY: number };
    }>({
        points: [],
        sticks: [],
        triangles: [],
        img: null,
        mouse: { x: -1000, y: -1000, active: false, dx: 0, dy: 0, lastX: -1000, lastY: -1000 }
    });

    useEffect(() => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
            engineRef.current.img = img;
            initPhysics();
            setLoaded(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    const initPhysics = () => {
        const canvas = canvasRef.current;
        const state = engineRef.current;
        if (!canvas || !state.img) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = state.img.naturalWidth;
        const ih = state.img.naturalHeight;

        const scale = Math.max(cw / iw, ch / ih);
        const mappedImgW = iw * scale;
        const mappedImgH = ih * scale;
        const offsetX = (cw - mappedImgW) / 2;
        const offsetY = (ch - mappedImgH) / 2;

        state.points = [];
        state.sticks = [];
        state.triangles = [];

        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
                const cellW = cw / cols;
                const cellH = ch / rows;
                const x = c * cellW;
                const y = r * cellH;

                let u = (x - offsetX) / scale;
                let v = (y - offsetY) / scale;

                u = Math.max(0, Math.min(iw, u));
                v = Math.max(0, Math.min(ih, v));

                const isEdge = (r === 0 || r === rows || c === 0 || c === cols);
                state.points.push(new Point(x, y, u, v, isEdge));
            }
        }

        const getIndex = (c: number, r: number) => r * (cols + 1) + c;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tl = getIndex(c, r);
                const tr = getIndex(c + 1, r);
                const bl = getIndex(c, r + 1);
                const br = getIndex(c + 1, r + 1);

                state.sticks.push(new Stick(state.points[tl], state.points[tr]));
                state.sticks.push(new Stick(state.points[tl], state.points[bl]));
                if (r === rows - 1) state.sticks.push(new Stick(state.points[bl], state.points[br]));
                if (c === cols - 1) state.sticks.push(new Stick(state.points[tr], state.points[br]));

                state.sticks.push(new Stick(state.points[tl], state.points[br]));
                state.sticks.push(new Stick(state.points[tr], state.points[bl]));

                // Add triangles in opposite orientation to cover quad
                state.triangles.push([tl, tr, bl]);
                state.triangles.push([tr, br, bl]);
            }
        }
    };

    useEffect(() => {
        if (!loaded) return;

        let animationFrameId: number;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d', { alpha: false }); // optimize
        if (!canvas || !ctx) return;

        // Anti-aliasing for the canvas itself
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const loop = () => {
            update();
            draw(ctx);
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        const handleResize = () => initPhysics();
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e: MouseEvent) => {
            const state = engineRef.current.mouse;
            state.active = true;
            state.dx = e.clientX - state.lastX;
            state.dy = e.clientY - state.lastY;
            state.x = e.clientX;
            state.y = e.clientY;
            state.lastX = e.clientX;
            state.lastY = e.clientY;
        };

        const handleMouseLeave = () => {
            engineRef.current.mouse.active = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded]);

    const update = () => {
        const state = engineRef.current;
        const time = Date.now() * 0.001;

        state.mouse.dx *= 0.9;
        state.mouse.dy *= 0.9;

        state.points.forEach((p) => {
            if (p.pinned) return;

            const wind = Math.sin(time * 2 + p.y * 0.01 + p.x * 0.005) * 1.8;
            const windY = Math.cos(time * 1.5 + p.x * 0.01) * 0.6;

            const dxBase = p.basex - p.x;
            const dyBase = p.basey - p.y;
            const springForceX = dxBase * (0.01 + stiffness * 0.05);
            const springForceY = dyBase * (0.01 + stiffness * 0.05);

            let mouseForceX = 0;
            let mouseForceY = 0;
            if (state.mouse.active) {
                const dx = p.x - state.mouse.x;
                const dy = p.y - state.mouse.y;
                const dist2 = dx * dx + dy * dy;
                const radius = 180;
                if (dist2 < radius * radius && dist2 > 0) {
                    const dist = Math.sqrt(dist2);
                    const force = (radius - dist) / radius;
                    mouseForceX = (dx / dist) * force * 15 + state.mouse.dx * force * 0.3;
                    mouseForceY = (dy / dist) * force * 15 + state.mouse.dy * force * 0.3;
                }
            }

            const vx = (p.x - p.oldx) * 0.91;
            const vy = (p.y - p.oldy) * 0.91;

            p.oldx = p.x;
            p.oldy = p.y;

            p.x += vx + wind + springForceX + mouseForceX;
            p.y += vy + windY + springForceY + mouseForceY;
        });

        const iterations = 4;
        for (let i = 0; i < iterations; i++) {
            state.sticks.forEach((s) => {
                const dx = s.p1.x - s.p2.x;
                const dy = s.p1.y - s.p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) return;

                const diff = (s.length - dist) / dist;
                const offsetx = dx * diff * 0.5;
                const offsety = dy * diff * 0.5;

                if (!s.p1.pinned) {
                    s.p1.x += offsetx;
                    s.p1.y += offsety;
                }
                if (!s.p2.pinned) {
                    s.p2.x -= offsetx;
                    s.p2.y -= offsety;
                }
            });
        }
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        const state = engineRef.current;
        if (!state.img || !canvasRef.current) return;

        // Base background fill to avoid artifacts outside the image bounds
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        state.triangles.forEach(([t1, t2, t3]) => {
            drawTexturedTriangle(
                ctx,
                state.img!,
                state.points[t1],
                state.points[t2],
                state.points[t3]
            );
        });
    };

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
            style={{
                opacity: loaded ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                background: '#0a0a0a'
            }}
        />
    );
}
