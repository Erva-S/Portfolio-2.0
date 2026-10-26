'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './FoldText.css';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const HINGES = {
  top: { origin: '50% 0%', axis: 'rotateX', sign: -1 },
  bottom: { origin: '50% 100%', axis: 'rotateX', sign: 1 },
  left: { origin: '0% 50%', axis: 'rotateY', sign: 1 },
  right: { origin: '100% 50%', axis: 'rotateY', sign: -1 }
};

const FOLD_STYLES = ['paper', 'blinds', 'flip'];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const FoldText = ({
  text = 'building my way up.',
  splitBy = 'char',
  hinge = 'top',
  foldStyle = 'paper',
  duration = 0.75,
  stagger = 0.03,
  staggerFrom = 'start',
  foldAngle = 90,
  ease = 'power3.out',
  perspective = 900,
  creaseShading = 0.45,
  trigger = 'hover',
  className = '',
  style = {}
}) => {
  const rootRef = useRef(null);
  const safeHinge = HINGES[hinge] ? hinge : 'top';
  const hingeConfig = HINGES[safeHinge];
  const safeStyle = FOLD_STYLES.includes(foldStyle) ? foldStyle : 'paper';
  const safeCrease = clamp(creaseShading, 0, 1);
  const safeAngle = clamp(foldAngle, 0, 180);
  const safeStagger = Math.max(0, stagger);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const elements = Array.from(root.querySelectorAll('.fold-text-piece'));
    if (!elements.length) return undefined;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const { axis, sign, origin } = hingeConfig;
    const unfoldEase = gsap.parseEase(reduceMotion ? 'power1.out' : ease) || gsap.parseEase('power3.out');
    const angle = reduceMotion ? 0 : safeAngle;
    const crease = reduceMotion ? 0 : safeCrease;
    const unfoldDuration = reduceMotion ? 0 : duration;
    const staggerVars = { each: reduceMotion ? 0 : safeStagger, from: staggerFrom };

    const pieces = elements.map(element => {
      element.style.transformOrigin = origin;
      element.style.backfaceVisibility = 'hidden';
      return { element, t: 0, f: 0 };
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
      timeline.fromTo(pieces, { t: 0, f: 0 }, { t: 1, duration: unfoldDuration, ease: 'none', stagger: staggerVars });
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
      render();
      play();
    }

    return () => {
      timeline?.kill();
      gsap.killTweensOf(pieces);
    };
  }, [hingeConfig, safeStyle, duration, safeStagger, staggerFrom, safeAngle, ease, safeCrease]);

  return (
    <span ref={rootRef} className={`fold-text ${className}`.trim()} style={style}>
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {text}
      </span>
    </span>
  );
};

export default FoldText;
