"use client";

import React, { useEffect, useRef } from 'react';

// 3D Point with Verlet integration data
class Point {
    x: number;
    y: number;
    z: number;
    oldX: number;
    oldY: number;
    oldZ: number;
    radius: number;
    mass: number;

    constructor(x: number, y: number, z: number, mass = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.oldX = x;
        this.oldY = y;
        this.oldZ = z;
        this.radius = 2 + Math.random() * 3;
        this.mass = mass;
    }
}

// 3D Constraint between two points
class Constraint {
    p1: Point;
    p2: Point;
    length: number;
    stiffness: number;

    constructor(p1: Point, p2: Point, stiffness = 0.05) {
        this.p1 = p1;
        this.p2 = p2;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        this.length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        this.stiffness = stiffness;
    }

    resolve() {
        const dx = this.p1.x - this.p2.x;
        const dy = this.p1.y - this.p2.y;
        const dz = this.p1.z - this.p2.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Prevent division by zero
        if (d === 0) return;

        const difference = (this.length - d) / d;

        // Apply stiffness and mass weighting
        const stiffnessWeight = this.stiffness;
        const m1 = this.p1.mass;
        const m2 = this.p2.mass;
        const totalMass = m1 + m2;

        const offsetX = dx * difference * stiffnessWeight;
        const offsetY = dy * difference * stiffnessWeight;
        const offsetZ = dz * difference * stiffnessWeight;

        this.p1.x += offsetX * (m2 / totalMass);
        this.p1.y += offsetY * (m2 / totalMass);
        this.p1.z += offsetZ * (m2 / totalMass);

        this.p2.x -= offsetX * (m1 / totalMass);
        this.p2.y -= offsetY * (m1 / totalMass);
        this.p2.z -= offsetZ * (m1 / totalMass);
    }
}

export function VerletBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Setup Retina/HiDPI display scaling
        const setCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Physics variables
        const points: Point[] = [];
        const constraints: Constraint[] = [];
        const friction = 0.99;

        // Mouse interaction state
        let mouseX = width / 2;
        let mouseY = height / 2;
        let isRepulsing = false;

        // Interaction handlers
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Activate dynamic repulsion when cursor moves quickly
            isRepulsing = true;
            // Debounce the repulsion to let it calm down
            if ((window as any).repulseTimeout) clearTimeout((window as any).repulseTimeout);
            (window as any).repulseTimeout = setTimeout(() => isRepulsing = false, 200);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
                isRepulsing = true;
                if ((window as any).repulseTimeout) clearTimeout((window as any).repulseTimeout);
                (window as any).repulseTimeout = setTimeout(() => isRepulsing = false, 200);
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        // Build the abstract organic 3D structure (like a soft-body jellyfish or fluid net)
        const initStructures = () => {
            points.length = 0;
            constraints.length = 0;

            const numNodes = 70; // Keep it lightweight

            // Create points in an abstract 3D blob
            for (let i = 0; i < numNodes; i++) {
                // Random spherical distribution
                const theta = Math.random() * 2 * Math.PI;
                const phi = Math.acos(2 * Math.random() - 1);
                // Base radius of the organic shape
                const baseR = 250 + Math.random() * 150;

                const pX = (width / 2) + baseR * Math.sin(phi) * Math.cos(theta);
                const pY = (height / 2) + baseR * Math.sin(phi) * Math.sin(theta);
                const pZ = baseR * Math.cos(phi);

                points.push(new Point(pX, pY, pZ, 1 + Math.random()));
            }

            // Connect points to form soft-body mesh
            for (let i = 0; i < numNodes; i++) {
                // Connect each node to 2-3 of its nearest neighbors
                const neighbors = points
                    .map((p, index) => ({ p, index, dist: distance3D(points[i], p) }))
                    .filter(n => n.dist > 0) // exclude self
                    .sort((a, b) => a.dist - b.dist)
                    .slice(0, 3);

                neighbors.forEach(n => {
                    // Add constraint if it doesn't already exist inversely
                    const exists = constraints.some(c =>
                        (c.p1 === points[i] && c.p2 === n.p) ||
                        (c.p2 === points[i] && c.p1 === n.p)
                    );

                    if (!exists) {
                        // Organic soft connections
                        constraints.push(new Constraint(points[i], n.p, 0.02));
                    }
                });
            }
        };

        // Utility: 3D distance
        const distance3D = (p1: Point, p2: Point) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dz = p1.z - p2.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };

        initStructures();

        // 3D Perspective Projection config
        const fov = 1000;

        // Base theme colors from your Tailwind config
        const bgDark = '#0B0E14'; // Background Dark
        const accentRed = 'rgba(128, 0, 32, 0.4)'; // Primary / Burgundy
        const accentCyan = 'rgba(0, 240, 255, 0.6)'; // Neon Cyan

        // Main animation loop
        const loop = () => {
            // Smooth screen clear (no grid lines)
            ctx.fillStyle = bgDark;
            ctx.fillRect(0, 0, width, height);

            // Time-based organic rotation
            const time = Date.now() * 0.0005;
            const rotSpeed = 0.5;

            // 1. VERLET INTEGRATION (Update positions)
            points.forEach(p => {
                const vx = (p.x - p.oldX) * friction;
                const vy = (p.y - p.oldY) * friction;
                const vz = (p.z - p.oldZ) * friction;

                p.oldX = p.x;
                p.oldY = p.y;
                p.oldZ = p.z;

                p.x += vx;
                p.y += vy;
                p.z += vz;

                // Add slight organic ambient sway
                p.x += Math.sin(time + p.y * 0.01) * rotSpeed;
                p.y += Math.cos(time + p.x * 0.01) * rotSpeed;
                // Slowly rotate the entire blob around origin
                const centerX = width / 2;
                const centerZ = 0;

                const rx = p.x - centerX;
                const rz = p.z - centerZ;

                const angle = 0.001; // Slow continuous rotation
                const s = Math.sin(angle);
                const c = Math.cos(angle);

                p.x = rx * c - rz * s + centerX;
                p.z = rx * s + rz * c + centerZ;

                // MOUSE REPULSION
                // Using projected 2D coords for accurate mouse interaction
                const scale = fov / (fov + p.z);
                const projX = (p.x - width / 2) * scale + width / 2;
                const projY = (p.y - height / 2) * scale + height / 2;

                const mDx = projX - mouseX;
                const mDy = projY - mouseY;
                const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

                if (mDist < 250) { // Interaction radius
                    // Apply force inversely proportional to distance
                    const force = (250 - mDist) / 250;

                    if (isRepulsing) {
                        // Repulse smoothly
                        p.x += mDx * force * 0.05;
                        p.y += mDy * force * 0.05;
                    } else {
                        // Gently attract when idle to create parallax feel
                        p.x -= mDx * force * 0.01;
                        p.y -= mDy * force * 0.01;
                    }
                }
            });

            // 2. CONSTRAINTS (Resolve physical bonds)
            // Multiple iterations for stability in soft bodies
            for (let i = 0; i < 3; i++) {
                constraints.forEach(c => c.resolve());
            }

            // 3. RENDER PHASE (3D Projection -> 2D Canvas)
            // Sort lines by Z-depth (painters algorithm)
            const linesToDraw = constraints.map(c => {
                const scale1 = fov / (fov + c.p1.z);
                const x1 = (c.p1.x - width / 2) * scale1 + width / 2;
                const y1 = (c.p1.y - height / 2) * scale1 + height / 2;

                const scale2 = fov / (fov + c.p2.z);
                const x2 = (c.p2.x - width / 2) * scale2 + width / 2;
                const y2 = (c.p2.y - height / 2) * scale2 + height / 2;

                const avgZ = (c.p1.z + c.p2.z) / 2;
                return { x1, y1, x2, y2, avgZ, scale1, scale2 };
            });

            linesToDraw.sort((a, b) => b.avgZ - a.avgZ);

            ctx.lineWidth = 1;
            ctx.lineCap = 'round';

            linesToDraw.forEach(l => {
                // Don't draw lines too close or behind the camera
                if (l.avgZ < -800) return;

                // Depth fading (fog effect)
                const fade = Math.max(0, Math.min(1, 1 - (l.avgZ + 500) / 1500));
                if (fade <= 0) return;

                // Dynamic styling: mix red and cyan based on depth creating a fluid gradient
                const isCyan = Math.sin(l.avgZ * 0.01) > 0;

                ctx.beginPath();
                ctx.moveTo(l.x1, l.y1);
                ctx.lineTo(l.x2, l.y2);

                // Extremely soft, abstract lines - no harsh grids
                // The thicker the depth, the softer it looks
                if (isCyan) {
                    ctx.strokeStyle = `rgba(0, 240, 255, ${fade * 0.15})`;
                } else {
                    ctx.strokeStyle = `rgba(128, 0, 32, ${fade * 0.25})`;
                }

                ctx.stroke();
            });

            // Optional: Draw subtle glowing nodes at the points closest to camera
            points.forEach(p => {
                if (p.z > 200 || p.z < -400) return; // Only draw inner/middle layer nodes
                const scale = fov / (fov + p.z);
                const x = (p.x - width / 2) * scale + width / 2;
                const y = (p.y - height / 2) * scale + height / 2;

                const fade = Math.max(0, Math.min(1, 1 - (p.z + 500) / 1500));

                ctx.beginPath();
                ctx.arc(x, y, p.radius * scale * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 240, 255, ${fade * 0.3})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
            if ((window as any).repulseTimeout) clearTimeout((window as any).repulseTimeout);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-10] pointer-events-none"
            style={{ display: 'block' }}
        />
    );
}
