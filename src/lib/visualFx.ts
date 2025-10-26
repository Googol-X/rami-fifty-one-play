// Visual effects for game events (GPU-friendly, respects reduced-motion)

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export interface ConfettiOptions {
  count?: number;
  duration?: number;
  colors?: string[];
}

export function confettiLight(
  container: HTMLElement,
  options: ConfettiOptions = {}
) {
  if (prefersReducedMotion()) {
    // Skip confetti for reduced motion
    return () => {};
  }

  const {
    count = 60,
    duration = 800,
    colors = ['#FFD54A', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'],
  } = options;

  const confettiElements: HTMLElement[] = [];
  const containerRect = container.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '8px';
    confetti.style.height = '8px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${containerRect.left + containerRect.width / 2}px`;
    confetti.style.top = `${containerRect.top + containerRect.height / 2}px`;
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9998';
    confetti.style.borderRadius = '2px';
    confetti.style.willChange = 'transform, opacity';

    const angle = (Math.random() * Math.PI * 2);
    const velocity = 100 + Math.random() * 200;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 100; // slight upward bias
    const rotation = Math.random() * 720 - 360;

    document.body.appendChild(confetti);
    confettiElements.push(confetti);

    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        confetti.remove();
        return;
      }

      const x = vx * progress;
      const y = vy * progress + (0.5 * 500 * progress * progress); // gravity
      const opacity = 1 - progress;
      const scale = 1 - progress * 0.3;

      confetti.style.transform = `translate(${x}px, ${y}px) rotate(${rotation * progress}deg) scale(${scale})`;
      confetti.style.opacity = opacity.toString();

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  // Cleanup function
  return () => {
    confettiElements.forEach(el => el.remove());
  };
}

export function glowSweep(element: HTMLElement) {
  if (prefersReducedMotion()) {
    // Just add a quick highlight instead
    element.style.transition = 'box-shadow 120ms';
    element.style.boxShadow = '0 0 20px rgba(255, 213, 74, 0.8)';
    setTimeout(() => {
      element.style.boxShadow = '';
    }, 120);
    return;
  }

  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.background = 'linear-gradient(90deg, transparent, rgba(255, 213, 74, 0.4), transparent)';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '1';
  overlay.style.willChange = 'transform';
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(overlay);

  let start = 0;
  const duration = 450;

  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);

    overlay.style.transform = `translateX(${-100 + progress * 200}%)`;
    overlay.style.opacity = (1 - progress).toString();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      overlay.remove();
    }
  };

  requestAnimationFrame(animate);
}

export function cameraNudge(element: HTMLElement, intensity = 0.7) {
  if (prefersReducedMotion()) {
    return;
  }

  const originalTransform = element.style.transform;
  
  const keyframes = [
    { transform: `translateX(0) scale(1)` },
    { transform: `translateX(${intensity * 2}px) scale(${1 + intensity * 0.01})` },
    { transform: `translateX(${-intensity}px) scale(${1 + intensity * 0.005})` },
    { transform: `translateX(0) scale(1)` },
  ];

  element.animate(keyframes, {
    duration: 150,
    easing: 'ease-out',
  });
}

export function pulseGlow(element: HTMLElement, color = 'rgba(255, 213, 74, 0.6)') {
  const duration = prefersReducedMotion() ? 100 : 300;
  
  element.animate([
    { boxShadow: `0 0 0 0 ${color}` },
    { boxShadow: `0 0 20px 10px ${color}` },
    { boxShadow: `0 0 0 0 ${color}` },
  ], {
    duration,
    easing: 'ease-out',
  });
}
