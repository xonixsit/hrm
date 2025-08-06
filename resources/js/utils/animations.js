/**
 * Animation utilities for modern UI/UX interactions
 * Provides consistent animation timing, easing, and performance optimization
 */

// Animation constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
  slowest: 800
};

export const ANIMATION_EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

// Performance optimization utilities
export const requestAnimationFrame = window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  ((callback) => setTimeout(callback, 16));

export const cancelAnimationFrame = window.cancelAnimationFrame || 
  window.webkitCancelAnimationFrame || 
  window.mozCancelAnimationFrame || 
  clearTimeout;

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preferences
 */
export const getAnimationDuration = (duration) => {
  return prefersReducedMotion() ? 0 : duration;
};

/**
 * Smooth scroll utility with customizable easing
 */
export const smoothScrollTo = (element, options = {}) => {
  const {
    duration = ANIMATION_DURATION.slow,
    easing = ANIMATION_EASING.easeInOut,
    offset = 0
  } = options;

  if (prefersReducedMotion()) {
    element.scrollIntoView({ behavior: 'auto' });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start = window.pageYOffset;
    const target = element.offsetTop - offset;
    const distance = target - start;
    let startTime = null;

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Apply easing function
      const easedProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, start + distance * easedProgress);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
};/**
 * 
Easing functions
 */
export const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};

export const easeOutBounce = (t) => {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
};

/**
 * Stagger animation utility for lists
 */
export const staggerAnimation = (elements, animation, delay = 50) => {
  if (prefersReducedMotion()) return Promise.resolve();
  
  const promises = elements.map((element, index) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        animation(element).then(resolve);
      }, index * delay);
    });
  });
  
  return Promise.all(promises);
};

/**
 * Parallax scroll effect
 */
export const createParallaxEffect = (element, speed = 0.5) => {
  if (prefersReducedMotion()) return () => {};
  
  const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * speed;
    element.style.transform = `translateY(${parallax}px)`;
  };
  
  window.addEventListener('scroll', updateParallax, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', updateParallax);
  };
};

/**
 * Intersection Observer for scroll animations
 */
export const createScrollAnimation = (elements, animationClass = 'animate-fade-in') => {
  if (prefersReducedMotion()) return () => {};
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  
  elements.forEach((element) => {
    observer.observe(element);
  });
  
  return () => observer.disconnect();
};

/**
 * Button ripple effect
 */
export const createRippleEffect = (button, event = null) => {
  if (prefersReducedMotion()) return () => {};
  
  const handleRipple = (e) => {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple ${ANIMATION_DURATION.normal}ms linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 0;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, ANIMATION_DURATION.normal);
  };
  
  // If event is provided, create ripple immediately
  if (event) {
    handleRipple(event);
    return () => {};
  }
  
  // Otherwise, set up event listener
  button.addEventListener('click', handleRipple);
  
  return () => {
    button.removeEventListener('click', handleRipple);
  };
};

/**
 * Performance monitoring for animations
 */
export const monitorAnimationPerformance = (animationName, callback) => {
  const startTime = performance.now();
  let frameCount = 0;
  let animationId;
  
  const measureFrame = () => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      console.log(`Animation "${animationName}" FPS: ${fps}`);
      
      if (fps < 30) {
        console.warn(`Animation "${animationName}" is running below 30 FPS`);
      }
      
      if (callback) callback(fps);
      return;
    }
    
    animationId = requestAnimationFrame(measureFrame);
  };
  
  animationId = requestAnimationFrame(measureFrame);
  
  return () => cancelAnimationFrame(animationId);
};