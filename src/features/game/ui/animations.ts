import { Variants } from 'framer-motion';

export const cardDealVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5, 
    y: -100,
    rotateZ: -15
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    rotateZ: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1] // spring-like easing
    }
  })
};

export const cardHoverVariants: Variants = {
  hover: {
    y: -12,
    scale: 1.08,
    rotate: [0, -2, 2, 0],
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const playerHaloVariants: Variants = {
  inactive: {
    boxShadow: "0 0 0 0 transparent",
    scale: 1
  },
  active: {
    boxShadow: [
      "0 0 25px 8px hsl(var(--primary) / 0.6)",
      "0 0 35px 12px hsl(var(--primary) / 0.8)",
      "0 0 25px 8px hsl(var(--primary) / 0.6)"
    ],
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const meldPlacementVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.3,
    rotate: -20,
    y: -50
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // spring easing
      opacity: { duration: 0.3 }
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
  visible: (i: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, 1.5, 1.2, 0.8],
    y: [0, -150 + Math.random() * 50, -300 + Math.random() * 100],
    x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
    rotate: [0, 360 + Math.random() * 360],
    transition: {
      duration: 2 + Math.random(),
      ease: "easeOut",
      delay: i * 0.05
    }
  })
};

// Variante pour le shimmer effect sur les cartes
export const cardShimmerVariants: Variants = {
  initial: {
    backgroundPosition: "-200% center"
  },
  animate: {
    backgroundPosition: "200% center",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Variante pour le pulse sur les boutons d'action
export const buttonPulseVariants: Variants = {
  idle: {
    scale: 1
  },
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 hsl(var(--primary) / 0)",
      "0 0 0 10px hsl(var(--primary) / 0.2)",
      "0 0 0 0 hsl(var(--primary) / 0)"
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Variante pour l'apparition du winner
export const winnerAppearVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};
