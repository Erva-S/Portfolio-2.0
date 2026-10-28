import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

const SCRUB_SPAN = 0.5;
const RISE_MASK = "inset(-1em -1em -0.15em -1em)";

const clampToScroll = (position) =>
  typeof position === "string" && !position.startsWith("clamp(") ? `clamp(${position})` : position;

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const smooth = (value) => value * value * (3 - 2 * value);
const easeOut = (value) => 1 - Math.pow(1 - value, 3);
const easeBack = (value, overshoot) => {
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted;
};
const glowAt = (value) => {
  if (value <= 0 || value >= 1) return 0;
  return value < 0.35 ? smooth(value / 0.35) : 1 - smooth((value - 0.35) / 0.65);
};

const paintPiece = (piece, progress, look) => {
  let reveal = progress;
  let fadeIn = progress;
  let motion = "";

  if (look.effect === "rise") {
    reveal = easeOut(progress);
    fadeIn = clamp01(reveal * 1.25);
    if (reveal < 1) {
      motion = look.masked
        ? `translateY(${((1 - reveal) * 100).toFixed(2)}%) translateY(${((1 - reveal) * 0.2).toFixed(3)}em)`
        : `translateY(${((1 - reveal) * 0.8).toFixed(3)}em)`;
    }
  } else if (look.effect === "flip") {
    reveal = easeBack(progress, 1.2);
    fadeIn = clamp01(progress * 2);
    if (progress < 1) motion = `perspective(6em) rotateX(${((1 - reveal) * 90).toFixed(2)}deg)`;
  } else if (look.effect === "scale") {
    reveal = easeBack(progress, 1.6);
    fadeIn = clamp01(progress * 1.6);
    if (progress < 1) motion = `scale(${(0.35 + 0.65 * reveal).toFixed(4)})`;
  }

  if (look.highlightColor) fadeIn = Math.max(fadeIn, clamp01(progress / 0.35));
  const settle = clamp01(reveal);
  const lift = look.offset * (1 - settle);

  piece.style.opacity = progress >= 1
    ? ""
    : (look.baseOpacity + (1 - look.baseOpacity) * fadeIn).toFixed(3);
  piece.style.transform = [lift ? `translateY(${lift.toFixed(2)}px)` : "", motion].filter(Boolean).join(" ");
  piece.style.filter = look.blur && settle < 1 ? `blur(${(look.blur * (1 - settle)).toFixed(2)}px)` : "";

  if (look.highlightColor) {
    const glow = glowAt(progress);
    piece.style.color = glow > 0.002
      ? `color-mix(in srgb, ${look.highlightColor} ${(glow * 100).toFixed(1)}%, currentColor)`
      : "";
  }
};

const textFromElement = (element) => element.textContent.replace(/\s+/g, " ").trim();

const splitText = (text, splitBy) => {
  const fragment = document.createDocumentFragment();
  text.split(/(\s+)/).forEach((part) => {
    if (/^\s+$/.test(part)) {
      fragment.append(document.createTextNode(part));
      return;
    }

    const word = document.createElement("span");
    word.className = "scroll-reveal-word";
    if (splitBy === "chars") {
      Array.from(part).forEach((character) => {
        const piece = document.createElement("span");
        piece.className = "scroll-reveal-piece";
        piece.textContent = character;
        word.append(piece);
      });
    } else {
      const piece = document.createElement("span");
      piece.className = "scroll-reveal-piece";
      piece.textContent = part;
      word.append(piece);
    }
    fragment.append(word);
  });
  return fragment;
};

/**
 * Vanilla integration of the React Bits ScrollReveal implementation.
 * The public options mirror the component so the same reveal can be used by
 * the existing static/Vite page without introducing a React runtime.
 */
export function initScrollReveal(target, options = {}) {
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) return null;

  const {
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    baseOffset = 0,
    stagger = 0.05,
    smoothing = 0,
    splitBy = "words",
    effect = "fade",
    mode = "scrub",
    duration = 0.8,
    highlightColor = "",
    containerClassName = "",
    textClassName = "",
    rotationEnd = "bottom bottom",
    wordAnimationEnd = "bottom bottom"
  } = options;

  const originalHTML = element.innerHTML;
  const originalAriaLabel = element.getAttribute("aria-label");
  const text = textFromElement(element);
  if (!text) return null;

  element.classList.add("scroll-reveal", ...containerClassName.split(/\s+/).filter(Boolean));
  if (!element.hasAttribute("aria-label")) element.setAttribute("aria-label", text);

  const textElement = document.createElement("span");
  textElement.className = `scroll-reveal-text ${textClassName}`.trim();
  textElement.setAttribute("aria-hidden", "true");
  textElement.append(splitText(text, splitBy));
  element.replaceChildren(textElement);

  const scroller = scrollContainerRef?.current || scrollContainerRef || window;
  const wrappers = [...element.querySelectorAll(".scroll-reveal-word")];
  const pieces = wrappers.length
    ? [...element.querySelectorAll(".scroll-reveal-piece")]
    : [textElement];
  const viewportHeight = () => scroller instanceof HTMLElement ? scroller.clientHeight : window.innerHeight;
  const scrub = smoothing > 0 ? smoothing : true;
  const span = mode === "enter" ? Math.max(0.05, duration) : SCRUB_SPAN;
  const gap = Math.max(0, stagger);
  const look = {
    effect,
    masked: effect === "rise" && wrappers.length > 0,
    baseOpacity,
    blur: enableBlur ? blurStrength : 0,
    offset: baseOffset,
    highlightColor
  };
  const media = gsap.matchMedia();

  media.add("(prefers-reduced-motion: no-preference)", () => {
    const order = pieces.map((_, index) => index);
    const last = pieces.map(() => -1);
    const state = { p: 0 };
    let count = pieces.length;

    const measure = () => {
      if (splitBy !== "lines" || !wrappers.length) return;
      let line = -1;
      let top = -Infinity;
      wrappers.forEach((wrapper, index) => {
        const next = wrapper.offsetTop;
        if (Math.abs(next - top) > 2) {
          line += 1;
          top = next;
        }
        order[index] = line;
      });
      count = line + 1;
    };

    let maxP = 0;
    const total = () => span + Math.max(0, count - 1) * gap;
    const render = () => {
      maxP = Math.max(maxP, state.p);
      const effectiveP = maxP;
      const at = effectiveP * total();
      pieces.forEach((piece, index) => {
        const progress = clamp01((at - order[index] * gap) / span);
        if (progress === last[index]) return;
        last[index] = progress;
        paintPiece(piece, progress, look);
      });
    };

    measure();
    pieces.forEach((piece) => {
      piece.style.willChange = pieces.length > 80
        ? ""
        : effect === "fade" && !baseOffset ? "opacity" : "opacity, transform";
      piece.style.transformOrigin = effect === "flip" ? "50% 100%" : "";
    });
    if (look.masked) wrappers.forEach((wrapper) => { wrapper.style.clipPath = RISE_MASK; });
    render();

    if (mode === "enter") {
      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        gsap.to(state, { p: 1, duration: total(), ease: "none", onUpdate: render });
        if (baseRotation) gsap.to(element, { rotate: 0, duration: Math.min(total(), 1.4), ease: "power3.out" });
      };
      const startAt = () => {
        const view = viewportHeight();
        const top = element.getBoundingClientRect().top - (
          scroller instanceof HTMLElement
            ? scroller.getBoundingClientRect().top + scroller.clientTop - scroller.scrollTop
            : -window.scrollY
        );
        const raw = top - view + 0.2 * Math.min(element.offsetHeight, view);
        return Math.min(raw, ScrollTrigger.maxScroll(scroller) - 1);
      };
      if (baseRotation) gsap.set(element, { transformOrigin: "0% 50%", rotate: baseRotation });
      ScrollTrigger.create({
        trigger: element,
        scroller,
        start: startAt,
        onEnter: play,
        onLeave: play,
        onRefresh: (self) => { if (self.progress > 0) play(); }
      });
    } else {
      if (baseRotation) {
        gsap.fromTo(element, { transformOrigin: "0% 50%", rotate: baseRotation }, {
          ease: "none",
          rotate: 0,
          scrollTrigger: { trigger: element, scroller, start: "top bottom", end: clampToScroll(rotationEnd), scrub }
        });
      }
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: render,
        scrollTrigger: {
          trigger: element,
          scroller,
          start: () => `top bottom-=${0.18 * Math.min(element.offsetHeight, viewportHeight())}`,
          end: clampToScroll(wordAnimationEnd),
          scrub,
          onLeaveBack: () => {
            maxP = 0;
            state.p = 0;
            last.fill(-1);
            render();
          }
        }
      });
    }

    const resizeObserver = splitBy === "lines" && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => { measure(); last.fill(-1); render(); })
      : null;
    resizeObserver?.observe(textElement);

    return () => {
      resizeObserver?.disconnect();
      pieces.forEach((piece) => {
        piece.style.opacity = "";
        piece.style.transform = "";
        piece.style.transformOrigin = "";
        piece.style.filter = "";
        piece.style.color = "";
        piece.style.willChange = "";
      });
      wrappers.forEach((wrapper) => { wrapper.style.clipPath = ""; });
    };
  });

  const destroy = () => {
    media.revert();
    element.innerHTML = originalHTML;
    element.classList.remove("scroll-reveal", ...containerClassName.split(/\s+/).filter(Boolean));
    if (originalAriaLabel === null) element.removeAttribute("aria-label");
    else element.setAttribute("aria-label", originalAriaLabel);
  };

  return { element, refresh: () => ScrollTrigger.refresh(), destroy };
}

export default initScrollReveal;
