import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

/**
 * SlidingTabsTransition
 * 
 * A reusable animation wrapper for horizontal slide transitions between tabs.
 * Uses Framer Motion for GPU-accelerated, smooth animations.
 * 
 * Features:
 * - Direction-aware sliding (left/right based on tab index)
 * - GPU-accelerated transforms (no layout shifts)
 * - Configurable duration and easing
 * - AnimatePresence for proper exit animations
 */

export type SlideDirection = 'left' | 'right';

interface SlidingTabsTransitionProps {
  /** Unique key for the current tab (triggers animation on change) */
  tabKey: string;
  /** The direction to slide: 'left' or 'right' */
  direction: SlideDirection;
  /** The content to animate */
  children: React.ReactNode;
  /** Animation duration in seconds (default: 0.25) */
  duration?: number;
  /** Horizontal offset in pixels (default: 50) */
  offset?: number;
  /** Optional className for the motion container */
  className?: string;
}

/**
 * Generates animation variants based on direction and offset
 */
const createVariants = (direction: SlideDirection, offset: number): Variants => ({
  // Initial state: off-screen in the direction we're coming from
  initial: {
    x: direction === 'left' ? offset : -offset,
    opacity: 0,
  },
  // Animate to center
  animate: {
    x: 0,
    opacity: 1,
  },
  // Exit in the opposite direction
  exit: {
    x: direction === 'left' ? -offset : offset,
    opacity: 0,
  },
});

export const SlidingTabsTransition: React.FC<SlidingTabsTransitionProps> = ({
  tabKey,
  direction,
  children,
  duration = 0.25,
  offset = 50,
  className = '',
}) => {
  const variants = createVariants(direction, offset);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tabKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: [0.4, 0, 0.2, 1], // easeInOut cubic-bezier
        }}
        className={className}
        // Ensure GPU acceleration and prevent layout shifts
        style={{
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Hook to determine slide direction based on tab indices
 * 
 * @param currentIndex - The index of the current tab
 * @param previousIndex - The index of the previous tab
 * @returns 'left' if moving forward, 'right' if moving backward
 */
export const useSlideDirection = (
  currentIndex: number,
  previousIndex: number
): SlideDirection => {
  return currentIndex > previousIndex ? 'left' : 'right';
};

/**
 * Tab configuration type for the DashboardTabs component
 */
export interface TabConfig {
  id: string;
  label: string;
  index: number;
}

export default SlidingTabsTransition;







