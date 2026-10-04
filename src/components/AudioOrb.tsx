import React, { useEffect, useRef } from 'react';

interface AudioOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  isSpeaking: boolean;
  onClick?: () => void;
  size?: number;
}

export const AudioOrb: React.FC<AudioOrbProps> = ({
  state,
  isSpeaking,
  onClick,
  size = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let pulse = 0;

    const render = () => {
      angle += 0.03;
      pulse += 0.05;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = size * 0.32;

      ctx.clearRect(0, 0, width, height);

      // Determine palette based on state
      let color1 = 'rgba(168, 85, 247, 0.8)'; // Purple
      let color2 = 'rgba(236, 72, 153, 0.7)'; // Pink
      let color3 = 'rgba(56, 189, 248, 0.6)'; // Cyan
      let coreGlow = 'rgba(192, 132, 252, 0.4)';

      let pulseAmount = Math.sin(pulse) * 4;

      if (state === 'listening') {
        color1 = 'rgba(236, 72, 153, 0.9)'; // Vivid Rose
        color2 = 'rgba(244, 63, 94, 0.85)';
        color3 = 'rgba(251, 146, 60, 0.7)';
        pulseAmount = Math.sin(pulse * 2.2) * 12;
      } else if (state === 'thinking') {
        color1 = 'rgba(245, 158, 11, 0.85)'; // Amber gold
        color2 = 'rgba(168, 85, 247, 0.85)';
        color3 = 'rgba(14, 165, 233, 0.7)';
        pulseAmount = Math.sin(pulse * 3) * 6;
      } else if (state === 'speaking' || isSpeaking) {
        color1 = 'rgba(236, 72, 153, 0.95)'; // Magenta
        color2 = 'rgba(168, 85, 247, 0.85)'; // Violet
        color3 = 'rgba(99, 102, 241, 0.8)';  // Indigo
        pulseAmount = Math.sin(pulse * 2.5) * 14 + (Math.random() * 6);
      }

      // 1. Draw outer ambient aura
      const auraGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * 1.8 + pulseAmount
      );
      auraGrad.addColorStop(0, coreGlow);
      auraGrad.addColorStop(0.5, color1.replace('0.8', '0.2').replace('0.9', '0.2'));
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.8 + pulseAmount, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw outer energetic ripple waves
      const waveCount = state === 'speaking' ? 3 : state === 'listening' ? 4 : 2;
      for (let i = 0; i < waveCount; i++) {
        const waveRadius =
          baseRadius + 14 * (i + 1) + (Math.sin(pulse + i * 1.5) * (state === 'speaking' ? 10 : 5));
        const alpha = Math.max(0.1, 0.5 - i * 0.12);

        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = state === 'listening'
          ? `rgba(244, 63, 94, ${alpha})`
          : `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 3. Fluid Blob / Deformed circles
      ctx.save();
      ctx.beginPath();
      const points = 16;
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const waveFreq = state === 'thinking' ? 5 : 3;
        const deformation = Math.sin(theta * waveFreq + angle * 2) * (pulseAmount * 0.8);
        const r = baseRadius + deformation;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Multi-stop gradient for holographic sphere
      const sphereGrad = ctx.createLinearGradient(
        centerX - baseRadius,
        centerY - baseRadius,
        centerX + baseRadius,
        centerY + baseRadius
      );
      sphereGrad.addColorStop(0, color1);
      sphereGrad.addColorStop(0.5, color2);
      sphereGrad.addColorStop(1, color3);

      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = color1;
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.restore();

      // 4. Inner shimmering light reflection
      const innerGrad = ctx.createRadialGradient(
        centerX - baseRadius * 0.35,
        centerY - baseRadius * 0.35,
        baseRadius * 0.05,
        centerX,
        centerY,
        baseRadius
      );
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      innerGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
      innerGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 5. Soundwave bars in center when speaking or listening
      if (state === 'speaking' || state === 'listening') {
        const barCount = 7;
        const barWidth = 3.5;
        const spacing = 5;
        const totalWidth = barCount * barWidth + (barCount - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        ctx.fillStyle = '#ffffff';
        for (let b = 0; b < barCount; b++) {
          const bx = startX + b * (barWidth + spacing);
          const barHeight = 8 + Math.abs(Math.sin(pulse * 3 + b * 0.9)) * (state === 'speaking' ? 24 : 16);
          const by = centerY - barHeight / 2;

          ctx.beginPath();
          ctx.roundRect(bx, by, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, isSpeaking, size]);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size * 1.5}
        height={size * 1.5}
        className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};
