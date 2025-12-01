'use client';

import { useEffect, useRef } from 'react';
import { useMemoryStore } from '@/lib/memoryStore';
import { Memory, EMOTION_COLORS } from '@/lib/types';

interface CanvasProps {
  onMemoryHover?: (memory: Memory | null) => void;
}

export function Canvas({ onMemoryHover }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);
  
  const memories = useMemoryStore((state) => state.memories);
  const updateMemoryPosition = useMemoryStore((state) => state.updateMemoryPosition);
  const updateMemoryVelocity = useMemoryStore((state) => state.updateMemoryVelocity);
  const updateMemoryDecay = useMemoryStore((state) => state.updateMemoryDecay);
  const dominantEmotion = useMemoryStore((state) => state.dominantEmotion);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    // Dynamic import of p5 to avoid SSR issues
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;

      const sketch = (p: any) => {
        let backgroundHue = 0;
        let heartbeatPhase = 0;

        p.setup = () => {
          p.createCanvas(window.innerWidth, window.innerHeight);
          p.colorMode(p.HSB, 360, 100, 100, 100);
        };

        p.draw = () => {
          // Dynamic background based on dominant emotion
          if (dominantEmotion) {
            const targetHue = getHueFromColor(EMOTION_COLORS[dominantEmotion]);
            backgroundHue = p.lerp(backgroundHue, targetHue, 0.01);
          }
          
          // Very dark background with slight hue
          p.background(backgroundHue, 10, 2);

          // Heartbeat pulse
          heartbeatPhase += 0.01;
          const heartbeat = Math.sin(heartbeatPhase * Math.PI * 2 / 0.8);

          // Update and draw each memory orb
          memories.forEach((memory) => {
            drawMemoryOrb(p, memory, heartbeat);
            updatePhysics(p, memory);
          });

          // Draw connections between similar emotions
          if (memories.length > 2) {
            drawConnections(p);
          }

          // Mouse gravity effect - create a subtle trail
          if (p.mouseX > 0 && p.mouseY > 0) {
            p.noStroke();
            p.fill(255, 255, 100, 5);
            p.circle(p.mouseX, p.mouseY, 30);
          }
        };

        const drawMemoryOrb = (p: any, memory: Memory, heartbeat: number) => {
          const { position, intensity, emotion, decay } = memory;
          const color = EMOTION_COLORS[emotion];
          
          // Calculate size based on intensity and decay
          const baseSize = 20 + (intensity * 60);
          const size = baseSize * decay * (1 + heartbeat * 0.05);

          // Calculate opacity
          const opacity = decay * 80;

          // Outer glow
          for (let i = 3; i > 0; i--) {
            p.noStroke();
            p.fill(...hexToRgb(color), opacity / (i * 2));
            p.circle(position.x, position.y, size + i * 15);
          }

          // Main orb
          p.fill(...hexToRgb(color), opacity);
          p.noStroke();
          p.circle(position.x, position.y, size);

          // Inner highlight
          p.fill(255, 255, 100, opacity * 0.3);
          p.circle(position.x - size * 0.2, position.y - size * 0.2, size * 0.3);

          // Glitch effect for low decay memories
          if (decay < 0.5 && Math.random() < 0.1) {
            p.push();
            p.translate(position.x + (Math.random() - 0.5) * 4, position.y + (Math.random() - 0.5) * 4);
            p.fill(...hexToRgb(color), opacity * 0.5);
            p.circle(0, 0, size * 0.8);
            p.pop();
          }

          // Particle trails for very active memories
          if (intensity > 0.7 && decay > 0.7) {
            for (let i = 0; i < 3; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = size * 0.5 + Math.random() * 10;
              const px = position.x + Math.cos(angle) * dist;
              const py = position.y + Math.sin(angle) * dist;
              p.fill(...hexToRgb(color), opacity * 0.3);
              p.circle(px, py, 3);
            }
          }
        };

        const updatePhysics = (p: any, memory: Memory) => {
          const { position, velocity, id, decay, emotion } = memory;

          // Apply decay over time
          const newDecay = Math.max(0, decay - 0.0002);
          updateMemoryDecay(id, newDecay);

          // Mouse gravity
          const mouseX = p.mouseX;
          const mouseY = p.mouseY;
          const dx = mouseX - position.x;
          const dy = mouseY - position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200 && distance > 0) {
            const force = (200 - distance) / 200 * 0.3;
            velocity.x += (dx / distance) * force;
            velocity.y += (dy / distance) * force;
          }

          // Attraction/repulsion between orbs
          memories.forEach((other) => {
            if (other.id === id) return;

            const odx = other.position.x - position.x;
            const ody = other.position.y - position.y;
            const oDist = Math.sqrt(odx * odx + ody * ody);

            if (oDist < 150 && oDist > 0) {
              const sameEmotion = other.emotion === emotion;
              const force = sameEmotion ? 0.05 : -0.08;
              velocity.x += (odx / oDist) * force;
              velocity.y += (ody / oDist) * force;
            }
          });

          // Apply velocity with damping
          const newX = position.x + velocity.x;
          const newY = position.y + velocity.y;
          const dampedVx = velocity.x * 0.95;
          const dampedVy = velocity.y * 0.95;

          // Boundary collision with soft bounce
          let finalX = newX;
          let finalY = newY;
          let finalVx = dampedVx;
          let finalVy = dampedVy;

          const canvasWidth = p.width;
          const canvasHeight = p.height;

          if (newX < 30 || newX > canvasWidth - 30) {
            finalVx = -dampedVx * 0.7;
            finalX = Math.max(30, Math.min(canvasWidth - 30, newX));
          }

          if (newY < 30 || newY > canvasHeight - 30) {
            finalVy = -dampedVy * 0.7;
            finalY = Math.max(30, Math.min(canvasHeight - 30, newY));
          }

          updateMemoryPosition(id, finalX, finalY);
          updateMemoryVelocity(id, finalVx, finalVy);
        };

        const drawConnections = (p: any) => {
          for (let i = 0; i < memories.length; i++) {
            for (let j = i + 1; j < memories.length; j++) {
              const mem1 = memories[i];
              const mem2 = memories[j];

              if (mem1.emotion === mem2.emotion) {
                const dx = mem2.position.x - mem1.position.x;
                const dy = mem2.position.y - mem1.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                  const opacity = (1 - distance / 200) * mem1.decay * mem2.decay * 20;
                  p.stroke(...hexToRgb(EMOTION_COLORS[mem1.emotion]), opacity);
                  p.strokeWeight(1);
                  p.line(mem1.position.x, mem1.position.y, mem2.position.x, mem2.position.y);
                }
              }
            }
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        };
      };

      const hexToRgb = (hex: string): [number, number, number] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
          : [255, 255, 255];
      };

      const getHueFromColor = (hex: string): number => {
        const [r, g, b] = hexToRgb(hex);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        if (delta === 0) return 0;

        let hue = 0;
        if (max === r) {
          hue = ((g - b) / delta) % 6;
        } else if (max === g) {
          hue = (b - r) / delta + 2;
        } else {
          hue = (r - g) / delta + 4;
        }

        return (hue * 60 + 360) % 360;
      };

      if (canvasRef.current) {
        p5Instance.current = new p5(sketch, canvasRef.current);
      }
    });

    return () => {
      p5Instance.current?.remove();
    };
  }, [memories, dominantEmotion, updateMemoryDecay, updateMemoryPosition, updateMemoryVelocity]);

  return <div ref={canvasRef} className="canvas-container" />;
}
