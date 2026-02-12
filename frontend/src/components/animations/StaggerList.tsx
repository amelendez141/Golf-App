'use client';

import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants, EASING } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each item in seconds */
  staggerDelay?: number;
  /** Initial delay before stagger starts */
  initialDelay?: number;
}

/**
 * Container for staggered list animations.
 * Wrap your list items with this to get smooth staggered entrance animations.
 */
export function StaggerList({
  children,
  className,
  staggerDelay = 0.05,
  initialDelay = 0.1,
}: StaggerListProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: {},
        enter: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
        exit: {
          transition: {
            staggerChildren: staggerDelay * 0.5,
            staggerDirection: -1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  /** Custom animation variant */
  variant?: 'slide' | 'fade' | 'scale' | 'slideScale';
}

/**
 * Individual item within a StaggerList.
 * Each item will animate in sequence with the stagger delay.
 */
export function StaggerItem({
  children,
  className,
  variant = 'slideScale',
}: StaggerItemProps) {
  const variants = {
    slide: {
      initial: { opacity: 0, y: 20 },
      enter: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: EASING.decelerate },
      },
      exit: { opacity: 0, y: -10 },
    },
    fade: {
      initial: { opacity: 0 },
      enter: {
        opacity: 1,
        transition: { duration: 0.25 },
      },
      exit: { opacity: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      enter: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.25, ease: EASING.decelerate },
      },
      exit: { opacity: 0, scale: 0.95 },
    },
    slideScale: staggerItemVariants,
  };

  return (
    <motion.div variants={variants[variant]} className={className}>
      {children}
    </motion.div>
  );
}

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns for calculating stagger pattern */
  columns?: number;
}

/**
 * Grid-optimized stagger container.
 * Items animate in a wave pattern across the grid.
 */
export function StaggerGrid({
  children,
  className,
  columns = 3,
}: StaggerGridProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: {},
        enter: {
          transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
          },
        },
        exit: {
          transition: {
            staggerChildren: 0.03,
            staggerDirection: -1,
          },
        },
      }}
      className={cn('grid', className)}
    >
      {children}
    </motion.div>
  );
}
