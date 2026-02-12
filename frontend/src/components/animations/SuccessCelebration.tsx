'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  '#C4A265', // Gold accent
  '#1B3A2D', // Primary green
  '#22C55E', // Success green
  '#F5F0E8', // Sand
  '#A3C3B5', // Light green
  '#D4AF37', // Metallic gold
];

function generateConfetti(count: number, originX: number, originY: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: originX,
    y: originY,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  originX?: number;
  originY?: number;
  particleCount?: number;
}

/**
 * Confetti celebration effect.
 * Renders particles that burst and fall from a point.
 */
export function Confetti({
  active,
  onComplete,
  originX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  originY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  particleCount = 30,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      setPieces(generateConfetti(particleCount, originX, originY));
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [active, originX, originY, particleCount, onComplete]);

  if (typeof window === 'undefined' || !active) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => {
          const angle = (piece.id / particleCount) * Math.PI * 2;
          const velocity = 200 + Math.random() * 150;
          const xOffset = Math.cos(angle) * velocity;
          const yOffset = -150 + Math.random() * -100;

          return (
            <motion.div
              key={piece.id}
              initial={{
                x: piece.x,
                y: piece.y,
                scale: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: piece.x + xOffset,
                y: piece.y + yOffset + 400 + Math.random() * 200,
                scale: [0, 1, 1, 0.8],
                rotate: piece.rotation + 720 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 0.5,
                ease: [0.2, 0.8, 0.4, 1],
              }}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: 2,
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}

interface SuccessPulseProps {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Subtle success pulse effect.
 * Wraps content and adds a gentle pulse animation on success.
 */
export function SuccessPulse({ active, children, className }: SuccessPulseProps) {
  return (
    <motion.div
      animate={active ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SuccessCheckmarkProps {
  show: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Animated checkmark that draws itself on success.
 */
export function SuccessCheckmark({ show, size = 'md', className }: SuccessCheckmarkProps) {
  const sizes = {
    sm: 24,
    md: 48,
    lg: 72,
  };

  const dimension = sizes[size];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={className}
        >
          <svg
            width={dimension}
            height={dimension}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <motion.circle
              cx="24"
              cy="24"
              r="22"
              fill="#22C55E"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            />

            {/* Checkmark */}
            <motion.path
              d="M14 24L21 31L34 18"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.2 }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SuccessRippleProps {
  active: boolean;
  color?: string;
  className?: string;
}

/**
 * Ripple effect that expands outward on success.
 */
export function SuccessRipple({ active, color = '#22C55E', className }: SuccessRippleProps) {
  const [ripples, setRipples] = useState<number[]>([]);

  useEffect(() => {
    if (active) {
      const id = Date.now();
      setRipples((prev) => [...prev, id]);
      const timer = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r !== id));
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [active]);

  return (
    <div className={className}>
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for triggering celebrations
export function useCelebration() {
  const [isActive, setIsActive] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const celebrate = useCallback((event?: React.MouseEvent | { x: number; y: number }) => {
    if (event && 'clientX' in event) {
      setOrigin({ x: event.clientX, y: event.clientY });
    } else if (event && 'x' in event) {
      setOrigin({ x: event.x, y: event.y });
    } else if (typeof window !== 'undefined') {
      setOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
    }
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    origin,
    celebrate,
    reset,
  };
}
