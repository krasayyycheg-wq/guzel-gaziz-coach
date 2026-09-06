import { useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.6 + 0.4,
    pulseSpeed: Math.random() * 0.02 + 0.005,
    pulseOffset: Math.random() * Math.PI * 2,
  }));
}

function createStars(count: number, width: number, height: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.2 + 0.3,
    baseAlpha: Math.random() * 0.5 + 0.3,
    twinkleSpeed: Math.random() * 0.003 + 0.001,
    twinkleOffset: Math.random() * Math.PI * 2,
  }));
}

/**
 * Динамический фон на Canvas: плавающие частицы с соединяющими линиями,
 * мерцающие звёзды, золотистое свечение, медленно дрейфующие ауры.
 */
export function AnimatedBackground() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const isVisibleRef = useRef(true);

  const resizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    return { width: rect.width, height: rect.height };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let { width, height } = resizeCanvas(canvas);
    const density = Math.min(width, height) > 768 ? 100 : 50;
    const starCount = Math.min(width, height) > 768 ? 60 : 30;
    particlesRef.current = createParticles(density, width, height);
    starsRef.current = createStars(starCount, width, height);

    const handleResize = () => {
      ({ width, height } = resizeCanvas(canvas));
      const newDensity = Math.min(width, height) > 768 ? 100 : 50;
      const newStarCount = Math.min(width, height) > 768 ? 60 : 30;
      particlesRef.current = createParticles(newDensity, width, height);
      starsRef.current = createStars(newStarCount, width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibility);

    const draw = (time: number) => {
      if (!isVisibleRef.current) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const stars = starsRef.current;

      // Мерцающие звёзды (фоновый слой)
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5;
        const alpha = s.baseAlpha * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 200, ${alpha})`;
        ctx.fill();

        // Свечение для крупных звёзд
        if (s.radius > 0.8) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 6, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 6);
          gradient.addColorStop(0, `rgba(255, 214, 0, ${alpha * 0.15})`);
          gradient.addColorStop(1, 'rgba(255, 214, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      // Частицы и соединения
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Пульсация
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
        const currentAlpha = p.alpha * pulse;

        // Движение
        p.x += p.vx;
        p.y += p.vy;

        // Отскок от границ
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Легкое отталкивание от мыши
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }

        // Ограничение скорости
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1) {
          p.vx = (p.vx / speed) * 1;
          p.vy = (p.vy / speed) * 1;
        }

        // Соединения (только ближайшие соседи для оптимизации)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 140) {
            const lineAlpha = (1 - cdist / 140) * 0.25 * currentAlpha;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 214, 0, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Отрисовка частицы
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 214, 0, ${currentAlpha})`;
        ctx.fill();

        // Свечение для крупных частиц
        if (p.radius > 1.0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
          gradient.addColorStop(0, `rgba(255, 214, 0, ${currentAlpha * 0.4})`);
          gradient.addColorStop(1, 'rgba(255, 214, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reducedMotion, resizeCanvas]);

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
      {/* Canvas с частицами и звёздами */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 1 }}
      />

      {/* Дрейфующие градиентные ауры (яркие) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,214,0,0.18) 0%, rgba(255,214,0,0.06) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
        className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,214,0,0.15) 0%, rgba(255,224,51,0.05) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,245,160,0.10) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Horizontal light streaks */}
      <motion.div
        animate={{
          x: ['-100%', '200%'],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatDelay: 18,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-0 w-[200px] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,214,0,0.7), transparent)',
          filter: 'blur(2px)',
        }}
      />
      <motion.div
        animate={{
          x: ['200%', '-100%'],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          repeatDelay: 22,
          ease: 'easeInOut',
          delay: 5,
        }}
        className="absolute top-2/3 right-0 w-[300px] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,214,0,0.6), transparent)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
}
