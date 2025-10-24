import { Variants } from 'framer-motion';

export const cardDealVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: -50 
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

export const cardHoverVariants: Variants = {
  hover: {
    y: -10,
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

export const playerHaloVariants: Variants = {
  inactive: {
    boxShadow: "0 0 0 0 transparent"
  },
  active: {
    boxShadow: [
      "0 0 20px 5px hsl(var(--primary) / 0.5)",
      "0 0 30px 10px hsl(var(--primary) / 0.7)",
      "0 0 20px 5px hsl(var(--primary) / 0.5)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const meldPlacementVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
    rotate: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.4,
      ease: "backOut"
    }
  }
};

export const timerVariants: Variants = {
  full: { strokeDashoffset: 0 },
  empty: { 
    strokeDashoffset: 283,
    transition: { duration: 30, ease: "linear" }
  }
};

export const confettiVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 1, 0.8],
    y: [0, -100, -200],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      ease: "easeOut"
    }
  }
};
