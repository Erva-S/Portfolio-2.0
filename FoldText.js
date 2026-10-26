import { gsap } from 'gsap';
import './FoldText.css';

const HINGES = {
  top: { origin: '50% 0%', axis: 'rotateX', sign: -1 },
  bottom: { origin: '50% 100%', axis: 'rotateX', sign: 1 },
  left: { origin: '0% 50%', axis: 'rotateY', sign: 1 },
  right: { origin: '100% 50%', axis: 'rotateY', sign: -1 }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initFoldText(target, options = {}) {
  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) return null;

  const {
    hinge = 'top',
    duration = 0.72,
    foldDuration = 0.22,
    unfoldDuration = 0.52,
    stagger = 0.022,
    staggerFrom = 'start',
    foldAngle = 90,
    ease = 'power3.out',
    perspective = 900,
    creaseShading = 0.42,
    trigger = 'hover'
  } = options;

  const elements = Array.from(root.querySelectorAll('.fold-text-piece'));
  if (!elements.length) return null;
  const interactionRoot = root.querySelector('.fold-text-visual') || root;

  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const safeHinge = HINGES[hinge] ? hinge : 'top';
  const { axis, sign, origin } = HINGES[safeHinge];
  const unfoldEase = gsap.parseEase(ease) || gsap.parseEase('power3.out');
  const angle = clamp(foldAngle, 0, 180);
  const crease = clamp(creaseShading, 0, 1);

  root.style.setProperty('--fold-perspective', `${Math.max(120, perspective)}px`);

  // Pieces initialized at resting state: completely unfolded, flat, fully readable
  const pieces = elements.map(element => {
    element.style.transformOrigin = origin;
    element.style.backfaceVisibility = 'hidden';
    element.style.transform = 'none';
    element.style.opacity = '1';
    element.style.setProperty('--fold-crease', '0');
    return { element, t: 1 };
  });

  const shade = progress => String(crease * clamp(1 - progress, 0, 1));

  const render = () => {
    pieces.forEach(piece => {
      const progress = unfoldEase(piece.t);
      const turn = `${axis}(${sign * (1 - progress) * angle}deg)`;
      piece.element.style.transform = turn;
      piece.element.style.opacity = String(clamp(progress, 0, 1));
      piece.element.style.setProperty('--fold-crease', shade(progress));
    });
  };

  let timeline = null;
  let isAnimating = false;
  let isPointerInside = false;

  const resetToRest = () => {
    pieces.forEach(piece => {
      piece.t = 1;
      piece.element.style.transform = 'none';
      piece.element.style.opacity = '1';
      piece.element.style.setProperty('--fold-crease', '0');
    });
  };

  const playHoverEffect = () => {
    if (reduceMotion()) {
      resetToRest();
      return;
    }

    // Do not disrupt active text selection
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) return;

    timeline?.kill();
    resetToRest();
    isAnimating = true;
    timeline = gsap.timeline({
      onUpdate: render,
      onComplete: () => {
        isAnimating = false;
        resetToRest();
      }
    });

    const orderedPieces = staggerFrom === 'end' ? [...pieces].reverse() : pieces;

    orderedPieces.forEach((piece, index) => {
      const delay = index * stagger;

      // Phase 1: Crisp paper fold along hinge
      timeline.to(
        piece,
        {
          t: 0,
          duration: foldDuration,
          ease: 'power2.in'
        },
        delay
      );

      // Phase 2: Smooth unfolding back to flat resting state
      timeline.to(
        piece,
        {
          t: 1,
          duration: unfoldDuration,
          ease: unfoldEase
        },
        delay + foldDuration
      );
    });
  };

  // Attach hover and keyboard focus listeners
  const onPointerEnter = (e) => {
    if (e.pointerType === 'touch') return;
    isPointerInside = true;
    playHoverEffect();
  };

  const onFocusIn = () => {
    playHoverEffect();
  };

  const onPointerLeave = () => {
    isPointerInside = false;
    timeline?.kill();
    isAnimating = false;
    resetToRest();
  };

  const onFocusOut = () => {
    if (!isPointerInside) {
      timeline?.kill();
      isAnimating = false;
      resetToRest();
    }
  };

  if (trigger === 'hover') {
    interactionRoot.addEventListener('pointerenter', onPointerEnter, { passive: true });
    root.addEventListener('focusin', onFocusIn, { passive: true });
    interactionRoot.addEventListener('pointerleave', onPointerLeave, { passive: true });
    root.addEventListener('focusout', onFocusOut, { passive: true });
  } else {
    // If trigger is 'mount', play once
    playHoverEffect();
  }

  // Ensure resting state on load/refresh
  resetToRest();

  return {
    play: playHoverEffect,
    reset: resetToRest,
    destroy: () => {
      timeline?.kill();
      gsap.killTweensOf(pieces);
      interactionRoot.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('focusin', onFocusIn);
      interactionRoot.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('focusout', onFocusOut);
      resetToRest();
    }
  };
}

export default initFoldText;
