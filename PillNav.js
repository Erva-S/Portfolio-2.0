/**
 * PillNav Engine — React Bits Pill Navigation Implementation
 * Features spring-physics gliding pill, face roll animation, active dot indicator,
 * and responsive mobile drawer.
 */
import './PillNav.css';

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initPillNav(container, options = {}) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return null;

  const {
    items = [
      { label: 'Note', href: '#note' },
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Proof', href: '#proof' },
      { label: 'Build', href: '#work-with-me' },
      { label: 'Contact', href: '#contact' }
    ],
    defaultActiveIndex = -1,
    hoverEffect = 'fill', // 'fill' (rolling label + circle fill) or 'glide' (gliding pill follows hover)
    indicator = 'pill',   // 'pill' (gliding pill on active) or 'dot' (gold sliding dot)
    bounce = 0.35,
    stretch = 0.45,
    intro = true,
    onItemClick
  } = options;

  let activeIndex = (defaultActiveIndex === null || defaultActiveIndex === undefined || defaultActiveIndex < 0)
    ? -1
    : clamp(defaultActiveIndex, 0, items.length - 1);
  let open = false;

  const bar = root.querySelector('.pill-nav__bar');
  const track = root.querySelector('.pill-nav__track');
  const list = root.querySelector('.pill-nav__list');
  const glideEl = root.querySelector('.pill-nav__glide');
  const ink = root.querySelector('.pill-nav__ink');
  const dot = root.querySelector('.pill-nav__dot');
  const toggleBtn = root.querySelector('.pill-nav__toggle');
  const panel = root.querySelector('.pill-nav__panel');
  const slotElements = Array.from(root.querySelectorAll('.pill-nav__slot'));
  root.setAttribute('data-hover-effect', hoverEffect);
  root.setAttribute('data-indicator', indicator);

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const state = {
    x0: 0,
    x1: 0,
    v0: 0,
    v1: 0,
    alpha: 0,
    pop: 1,
    press: 1,
    pressVelocity: 0,
    dotX: 0,
    dotVelocity: 0,
    dotAlpha: 0,
    hover: -1,
    focus: false,
    sliding: false,
    pressing: false,
    waiting: intro && !reduce
  };

  const rects = [];
  let trackWidth = 0;
  let trackHeight = 0;
  let raf = 0;
  let last = 0;
  let disposed = false;

  const measure = () => {
    if (!track) return;
    trackWidth = track.offsetWidth;
    trackHeight = track.offsetHeight;
    slotElements.forEach((slot, index) => {
      if (!slot) return;
      rects[index] = { left: slot.offsetLeft, width: slot.offsetWidth };
      const reach = Math.ceil(2 * Math.sqrt((slot.offsetWidth / 2) ** 2 + slot.offsetHeight ** 2)) + 2;
      slot.style.setProperty('--pn-fill', `${reach}px`);
    });
  };

  const targetIndex = () => {
    if (hoverEffect === 'glide' && state.hover >= 0) return state.hover;
    return activeIndex;
  };

  const syncClasses = () => {
    slotElements.forEach((slot, index) => {
      const isCurrentActive = activeIndex >= 0 && index === activeIndex;
      const isHovered = state.hover === index;
      slot.toggleAttribute('data-lit', isHovered);
      slot.toggleAttribute('data-hover', isHovered && hoverEffect === 'fill');
      slot.toggleAttribute('data-on', isCurrentActive && hoverEffect === 'fill');

      const itemLink = slot.querySelector('.pill-nav__item');
      if (itemLink) {
        if (isCurrentActive) itemLink.setAttribute('aria-current', 'page');
        else itemLink.removeAttribute('aria-current');
      }
    });

    root.toggleAttribute('data-focus', state.focus && state.hover >= 0);
    root.toggleAttribute('data-dot-lit', hoverEffect === 'fill' && state.hover >= 0 && state.hover === activeIndex);

    // Sync mobile menu rows
    if (panel) {
      const rows = Array.from(panel.querySelectorAll('.pill-nav__row'));
      rows.forEach((row, idx) => {
        if (activeIndex >= 0 && idx === activeIndex) row.setAttribute('aria-current', 'page');
        else row.removeAttribute('aria-current');
      });
    }
  };

  const render = () => {
    const width = Math.max(0, state.x1 - state.x0);
    const scale = state.press * state.pop;
    const target = rects[targetIndex()];
    const squash = target ? 1 - clamp((width / Math.max(target.width, 1) - 1) * 0.3, 0, 0.14) : 1;

    if (glideEl) {
      glideEl.style.width = `${width}px`;
      glideEl.style.transform = `translate3d(${state.x0}px, 0, 0) scale(${scale}, ${scale * squash})`;
      glideEl.style.opacity = `${state.alpha}`;
    }

    if (ink) {
      const half = (width * scale) / 2;
      const center = (state.x0 + state.x1) / 2;
      const inset = (trackHeight * (1 - scale * squash)) / 2;
      ink.style.clipPath = `inset(${inset}px ${trackWidth - center - half}px ${inset}px ${center - half}px round ${trackHeight / 2}px)`;
      ink.style.opacity = `${state.alpha}`;
    }

    if (dot) {
      const pull = clamp(Math.abs(state.dotVelocity) / 700, 0, 2.2);
      dot.style.transform = `translate3d(${state.dotX}px, 0, 0) scaleX(${1 + pull})`;
      dot.style.opacity = `${state.dotAlpha}`;
    }
  };

  const tick = now => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const index = targetIndex();
    const target = rects[index];
    const zeta = 1 - 0.55 * clamp(bounce, 0, 1);
    const base = 520;
    let busy = false;

    if (target && !state.waiting) {
      const t0 = target.left;
      const t1 = target.left + target.width;

      if (state.alpha < 0.02 && !state.sliding) {
        state.x0 = t0;
        state.x1 = t1;
        state.v0 = 0;
        state.v1 = 0;
        state.pop = 0.9;
      }

      if (reduce) {
        state.x0 = t0;
        state.x1 = t1;
        state.v0 = 0;
        state.v1 = 0;
      } else {
        const direction = Math.sign((t0 + t1) / 2 - (state.x0 + state.x1) / 2);
        const sStretch = clamp(stretch, 0, 1);
        const lead = base * (1 + 0.9 * sStretch);
        const trail = base * (1 - 0.5 * sStretch);
        const k0 = direction < 0 ? lead : direction > 0 ? trail : base;
        const k1 = direction > 0 ? lead : direction < 0 ? trail : base;
        const steps = Math.ceil(dt / (1 / 240));
        const h = dt / steps;

        for (let i = 0; i < steps; i++) {
          state.v0 += (-k0 * (state.x0 - t0) - 2 * zeta * Math.sqrt(k0) * state.v0) * h;
          state.x0 += state.v0 * h;
          state.v1 += (-k1 * (state.x1 - t1) - 2 * zeta * Math.sqrt(k1) * state.v1) * h;
          state.x1 += state.v1 * h;
        }
      }

      state.alpha += (1 - state.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.06));
      busy =
        Math.abs(state.x0 - t0) > 0.05 ||
        Math.abs(state.x1 - t1) > 0.05 ||
        Math.abs(state.v0) > 0.5 ||
        Math.abs(state.v1) > 0.5 ||
        state.alpha < 0.999;
      if (!busy) state.sliding = false;
    } else {
      state.alpha += (0 - state.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.07));
      if (state.alpha > 0.002) busy = true;
      else state.alpha = 0;
    }

    state.pop += (1 - state.pop) * (reduce ? 1 : 1 - Math.exp(-dt / 0.09));
    if (Math.abs(1 - state.pop) > 0.001) busy = true;

    const pressTarget = state.pressing ? 0.95 : 1;
    if (reduce) {
      state.press = pressTarget;
      state.pressVelocity = 0;
    } else {
      state.pressVelocity += (-700 * (state.press - pressTarget) - 30 * state.pressVelocity) * dt;
      state.press += state.pressVelocity * dt;
    }
    if (Math.abs(state.press - pressTarget) > 0.0005 || Math.abs(state.pressVelocity) > 0.01) busy = true;

    // Dot spring indicator
    const dotTarget = activeIndex >= 0 ? rects[activeIndex] : null;
    if (dotTarget && !state.waiting) {
      const center = dotTarget.left + dotTarget.width / 2;
      if (state.dotAlpha < 0.02) {
        state.dotX = center;
        state.dotVelocity = 0;
      }
      if (reduce) {
        state.dotX = center;
        state.dotVelocity = 0;
      } else {
        const k = 360;
        const steps = Math.ceil(dt / (1 / 240));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          state.dotVelocity +=
            (-k * (state.dotX - center) - 2 * (1 - 0.5 * clamp(bounce, 0, 1)) * Math.sqrt(k) * state.dotVelocity) * h;
          state.dotX += state.dotVelocity * h;
        }
      }
      state.dotAlpha += (1 - state.dotAlpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.1));
      if (Math.abs(state.dotX - center) > 0.05 || Math.abs(state.dotVelocity) > 0.5 || state.dotAlpha < 0.999) {
        busy = true;
      }
    } else {
      state.dotAlpha += (0 - state.dotAlpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.1));
      if (state.dotAlpha > 0.002) busy = true;
      else state.dotAlpha = 0;
    }

    render();
    if (busy) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf && !disposed) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  };

  const enter = (index) => {
    state.hover = index;
    state.focus = false;
    syncClasses();
    wake();
  };

  const leave = () => {
    if (state.focus) return;
    state.hover = -1;
    syncClasses();
    wake();
  };

  const press = () => {
    state.pressing = true;
    wake();
  };

  const release = () => {
    if (!state.pressing) return;
    state.pressing = false;
    wake();
  };

  // Wire event listeners on each slot
  slotElements.forEach((slot, index) => {
    slot.addEventListener('pointerenter', e => {
      if (e.pointerType === 'touch') return;
      enter(index);
    });
    slot.addEventListener('pointerdown', press);
    slot.addEventListener('focusin', () => {
      state.focus = true;
      state.hover = index;
      syncClasses();
      wake();
    });
    slot.addEventListener('focusout', () => {
      state.focus = false;
      state.hover = -1;
      syncClasses();
      wake();
    });
  });

  if (track) {
    track.addEventListener('pointerleave', leave);
  }

  // Click handling
  root.addEventListener('click', event => {
    const link = event.target.closest('.pill-nav__item, .pill-nav__row');
    if (!link) return;
    const slot = link.closest('.pill-nav__slot');
    let idx = -1;
    if (slot) {
      idx = slotElements.indexOf(slot);
    } else if (link.hasAttribute('data-index')) {
      idx = parseInt(link.getAttribute('data-index'), 10);
    } else if (link.parentElement && link.parentElement.hasAttribute('data-index')) {
      idx = parseInt(link.parentElement.getAttribute('data-index'), 10);
    }

    if (idx >= 0 && idx < items.length) {
      setActive(idx, true);
      if (onItemClick) onItemClick(items[idx], idx, event);
    }

    if (open) {
      setMenuOpen(false);
    }
  });

  // Mobile menu toggle
  function setMenuOpen(val) {
    open = val;
    root.toggleAttribute('data-open', open);
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', String(open));
      toggleBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      setMenuOpen(!open);
    });
  }

  // Close mobile menu on escape or click outside
  document.addEventListener('pointerdown', event => {
    if (open && !root.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {
      setMenuOpen(false);
      toggleBtn?.focus();
    }
  });

  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  // ResizeObserver for tracking width/position updates
  const resizeObserver = new ResizeObserver(() => {
    measure();
    render();
    wake();
  });
  if (track) resizeObserver.observe(track);

  // Subtle entrance animation
  if (intro && !reduce) {
    if (bar) {
      bar.animate(
        [
          { opacity: 0, transform: 'scale(0.96) translateY(-4px)' },
          { opacity: 1, transform: 'scale(1) translateY(0)' }
        ],
        { duration: 600, easing: EASE_OUT, fill: 'backwards' }
      );
    }
    slotElements.forEach((slot, index) => {
      slot.animate(
        [
          { opacity: 0, transform: 'translateY(-6px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 480, delay: 100 + index * 40, easing: EASE_OUT, fill: 'backwards' }
      );
    });
    setTimeout(() => {
      state.waiting = false;
      state.sliding = true;
      wake();
    }, 380);
  } else {
    state.waiting = false;
  }

  measure();
  syncClasses();
  render();
  wake();

  function setActive(index, animate = true) {
    const nextIndex = (index === null || index === undefined || index < 0) ? -1 : clamp(index, 0, items.length - 1);
    if (nextIndex === activeIndex && (nextIndex >= 0 ? state.alpha > 0.8 : state.alpha < 0.05)) return;
    activeIndex = nextIndex;
    state.sliding = animate && !reduce;
    syncClasses();
    wake();
  }

  return {
    setActive,
    getActiveIndex: () => activeIndex,
    setMenuOpen: val => setMenuOpen(val),
    isMenuOpen: () => open,
    refresh: () => {
      measure();
      syncClasses();
      render();
      wake();
    },
    destroy: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    }
  };
}

export default initPillNav;
