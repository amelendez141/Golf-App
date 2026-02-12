'use client';

import type { Variants, Transition } from 'framer-motion';

// Timing constants for consistent animations
export const TIMING = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
  verySlow: 0.5,
} as const;

// Easing curves
export const EASING = {
  // Standard Material Design easing
  standard: [0.4, 0, 0.2, 1],
  // Deceleration curve - for elements entering the screen
  decelerate: [0, 0, 0.2, 1],
  // Acceleration curve - for elements leaving the screen
  accelerate: [0.4, 0, 1, 1],
  // Sharp curve - for elements that may return at any time
  sharp: [0.4, 0, 0.6, 1],
  // Premium spring settings
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 25 },
  springGentle: { type: 'spring', stiffness: 300, damping: 30 },
} as const;

// Page transition variants
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -8,
  },
};

export const pageTransitionConfig: Transition = {
  duration: TIMING.base,
  ease: EASING.decelerate,
};

// Fade variants
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide variants
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Scale variants
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const scaleBounceVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: EASING.springBouncy,
  },
  exit: { opacity: 0, scale: 0.9 },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Stagger item variants
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.slow,
      ease: EASING.decelerate,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: {
      duration: TIMING.fast,
    },
  },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: {
    y: 0,
    boxShadow: '0 2px 8px -2px rgba(27, 58, 45, 0.08), 0 4px 16px -4px rgba(27, 58, 45, 0.12)',
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 32px -8px rgba(27, 58, 45, 0.15), 0 16px 48px -12px rgba(27, 58, 45, 0.2)',
    transition: {
      duration: TIMING.base,
      ease: EASING.decelerate,
    },
  },
  tap: {
    y: -2,
    scale: 0.995,
    transition: {
      duration: TIMING.fast,
    },
  },
};

// Button press variants
export const buttonPressVariants: Variants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.97,
    transition: {
      duration: TIMING.fast,
      ease: EASING.sharp,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: TIMING.base,
      ease: EASING.decelerate,
    },
  },
};

// Toast slide variants
export const toastSlideVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.9,
  },
  enter: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: EASING.spring,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: {
      duration: TIMING.fast,
      ease: EASING.accelerate,
    },
  },
};

// Modal variants
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: TIMING.base },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMING.fast },
  },
};

export const modalContentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: EASING.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: TIMING.fast,
    },
  },
};

// Success celebration variants
export const successPulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

export const checkmarkVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
};

// Confetti particle config
export const createConfettiConfig = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2;
  const velocity = 150 + Math.random() * 100;
  const rotation = Math.random() * 360;

  return {
    x: Math.cos(angle) * velocity,
    y: Math.sin(angle) * velocity - 200,
    rotation: rotation + Math.random() * 720,
    scale: 0.5 + Math.random() * 0.5,
  };
};

// Skeleton shimmer keyframes (for CSS)
export const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Utility to create staggered delay
export function getStaggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay;
}

// Utility to create spring transition
export function springTransition(stiffness = 400, damping = 30): Transition {
  return {
    type: 'spring',
    stiffness,
    damping,
  };
}
