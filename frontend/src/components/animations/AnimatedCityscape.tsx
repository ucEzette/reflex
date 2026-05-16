import React, { useEffect, useRef } from 'react';

const AnimatedCityscape: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Particles for rain and orange snow drops
    interface Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      type: 'rain' | 'snow';
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 2 + Math.random() * 5,
        size: Math.random() * 2 + 1,
        type: Math.random() > 0.7 ? 'snow' : 'rain',
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    // Clouds - Formed and defined
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 120,
      speed: 0.15 + Math.random() * 0.2,
      size: 80 + Math.random() * 100,
      opacity: 0.5 + Math.random() * 0.2 // More defined clouds
    }));

    // Airplane - Adjusted for better hero visibility
    const airplane = {
      x: -300,
      y: 80,
      speed: 1.8,
      scale: 0.6
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Clouds (Defined Grey/White)
      clouds.forEach(cloud => {
        ctx.fillStyle = `rgba(240, 244, 248, ${cloud.opacity})`; // White/Grey formed clouds
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.size, cloud.size / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        cloud.x += cloud.speed;
        if (cloud.x - cloud.size > canvas.width) cloud.x = -cloud.size;
      });

      // 2. Draw Airplane
      ctx.save();
      ctx.translate(airplane.x, airplane.y);
      ctx.fillStyle = '#ffffff';
      // Simple airplane shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 10);
      ctx.lineTo(0, 20);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      airplane.x += airplane.speed;
      if (airplane.x > canvas.width + 100) {
        airplane.x = -200;
        airplane.y = 50 + Math.random() * 200;
      }

      // 3. Draw Particles (Rain and Orange Snow)
      particles.forEach(p => {
        if (p.type === 'rain') {
          ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1, p.y + 10);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255, 140, 0, ${p.opacity})`; // Light Orange
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add a glow effect to snow drops
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
        }

        p.y += p.speed;
        p.x += (Math.random() - 0.5) * 0.5; // Slight drift

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      ctx.shadowBlur = 0; // Reset shadow

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* The Remixed Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: 'url("/remixed_scene.png")',
          filter: 'brightness(1.05) contrast(1.02)'
        }}
      />
      
      {/* Animated River (SVG/CSS Filter trick for flow) */}
      <div className="absolute bottom-0 w-full h-[40%] pointer-events-none overflow-hidden opacity-40">
        <svg className="w-full h-full">
            <filter id="water-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="2" result="noise" seed="1">
                    <animate attributeName="baseFrequency" dur="30s" values="0.01 0.1;0.01 0.2;0.01 0.1" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
            </filter>
            <rect width="100%" height="100%" fill="url(#water-gradient)" filter="url(#water-noise)" />
            <defs>
                <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor="rgba(30, 58, 138, 0.4)" />
                </linearGradient>
            </defs>
        </svg>
      </div>

      {/* Canvas for Particles and Airplane */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
};

export default AnimatedCityscape;
