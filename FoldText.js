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
    duration = 0.75,
    stagger = 0.026,
    staggerFrom = 'start',
    foldAngle = 90,
    ease = 'power3.out',
    perspective = 900,
    creaseShading = 0.42
  } = options;

  const elements = Array.from(root.querySelectorAll('.fold-text-piece'));
  if (!elements.length) return null;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const safeHinge = HINGES[hinge] ? hinge : 'top';
  const { axis, sign, origin } = HINGES[safeHinge];
  const unfoldEase = gsap.parseEase(reduceMotion ? 'power1.out' : ease) || gsap.parseEase('power3.out');
  const angle = reduceMotion ? 0 : clamp(foldAngle, 0, 180);
  const crease = reduceMotion ? 0 : clamp(creaseShading, 0, 1);
  const unfoldDuration = reduceMotion ? 0 : duration;
  const staggerVars = { each: reduceMotion ? 0 : stagger, from: staggerFrom };

  root.style.setProperty('--fold-perspective', `${Math.max(120, perspective)}px`);

  const pieces = elements.map(element => {
    element.style.transformOrigin = origin;
    element.style.backfaceVisibility = 'hidden';
    return { element, t: 0 };
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

  const play = () => {
    timeline?.kill();
    timeline = gsap.timeline({ onUpdate: render });
    timeline.fromTo(
      pieces,
      { t: 0 },
      { t: 1, duration: unfoldDuration, ease: 'none', stagger: staggerVars }
    );
    render();
  };

  if (reduceMotion) {
    pieces.forEach(piece => {
      piece.t = 1;
      piece.element.style.transform = 'none';
      piece.element.style.opacity = '1';
      piece.element.style.setProperty('--fold-crease', '0');
    });
  } else {
    // Set initial folded state immediately so there is no flash
    render();
    play();
  }

  return {
    play,
    destroy: () => {
      timeline?.kill();
      gsap.killTweensOf(pieces);
    }
  };
}

export default initFoldText;
