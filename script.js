import { Forminit } from "forminit";
import { initPillNav } from "./PillNav.js";

const doc = document.documentElement;
doc.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const menuToggle = document.querySelector(".pill-nav__toggle");
const primaryNav = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const projectButtons = [...document.querySelectorAll("[data-project-id]")];
const dialog = document.querySelector("#project-dialog");
const preview = document.querySelector("#project-preview");
const stageTitle = document.querySelector("#stage-title");
const stageCategory = document.querySelector("#stage-category");
const stageStatus = document.querySelector("#stage-status");
const stageOpen = document.querySelector("[data-open-project]");
const inquiryForm = document.querySelector("#inquiry-form");
const formStatus = document.querySelector("#form-status");
const inquiryProject = document.querySelector("#inquiry-project");
const inquiryContext = document.querySelector("#inquiry-context");
const dialogInquiry = document.querySelector("[data-inquiry-project]");

// Forminit form: inputs are named fi-{type}-{name}. Rules: https://forminit.com/setup.md
const FORMINIT_FORM_ID = "jn7g4p33910";
const FIELD_ERRORS = {
  "sender.fullName": "Please use only letters, spaces, hyphens, apostrophes and periods.",
  "sender.email": "Please enter a valid email address.",
};

function errorText(error) {
  const field = error?.fieldName ?? /['"]([^'"]+)['"]/.exec(error?.message ?? "")?.[1];
  if (field && FIELD_ERRORS[field]) return FIELD_ERRORS[field];
  if (error?.error === "TOO_MANY_REQUESTS") return "Please wait a few seconds and try again.";
  return "Something went wrong. Please try again.";
}

let forminitInstance;
let isSendingForm = false;
const formStartedAt = Date.now();
const lastProjectFocus = { element: null };
let activeProjectId = "aethera";
let closingFromHistory = false;

const projects = {
  aethera: {
    number: "01",
    name: "Aethera",
    category: "Travel workspace · live companion",
    status: "Build in progress",
    stack: "React 18 · TypeScript · Vite · Tailwind CSS",
    repo: "https://github.com/Erva-S/odoo-LDCE",
    summary: "A luxury travel workspace concept moving from dreaming and planning into an in-destination companion.",
    objective: "Bring destination discovery, itinerary planning, budget context, and live journey support into one calm travel workspace.",
    contribution: "The public project evidence documents a React/TypeScript/Vite application and its component architecture. Individual contribution details are not separately documented in the current portfolio evidence, so this case study keeps that boundary visible.",
    decisions: "The documented direction uses editorial typography, a planning/live mode split, local persistence, destination data, and a staged planner flow rather than a single static landing page.",
    result: "Work in progress. The repository contains extensive product documentation and a working application direction; no verified public deployment is claimed here.",
    previewClass: "preview-theme-aethera",
    preview: `<div class="preview-art preview-art--aethera"><div class="preview-aethera-sun"></div><div class="preview-aethera-words"><span>Go somewhere</span><strong>worth remembering.</strong></div><div class="preview-aethera-panel"><span>LIVE JOURNEY</span><b>Panaji, Goa</b><small>DAY 04 / 10</small></div><div class="preview-grid-lines"></div><span class="preview-stamp">AE / 01</span></div>`,
  },
  dns: {
    number: "02",
    name: "DNS Cache Analysis",
    category: "Python · networks · experiment",
    status: "Completed experiment",
    stack: "Python · CSV · Matplotlib · Wireshark",
    repo: "https://github.com/Erva-S/dns-cache-analysis",
    summary: "A reproducible local simulator for cache hits, misses, TTL expiry, latency, and evidence-driven summaries.",
    objective: "Study how DNS caching and TTL affect the latency of repeated lookups through a controlled, local experiment.",
    contribution: "The repository documents a monotonic TTL cache, experiment workloads, CSV export, metric aggregation, visualizations, and unit tests. The project is described as an educational simulator, not a production resolver.",
    decisions: "Synthetic `.test` records, short demonstration TTLs, a configured artificial upstream delay, and generated CSV/graph outputs keep the experiment repeatable without pretending to measure the public internet.",
    result: "Completed educational experiment with documented run commands, generated evidence locations, and tests covering cache behavior and metrics.",
    previewClass: "preview-theme-dns",
    preview: `<div class="preview-art preview-art--dns"><div class="terminal-top"><span></span><span></span><span></span><b>dns-cache-analysis</b></div><div class="terminal-command"><span>&gt;</span> python main.py experiment</div><div class="terminal-metrics"><div><small>STATUS</small><strong>EXPIRED</strong></div><div><small>TTL</small><strong>0.5s</strong></div></div><div class="terminal-chart"><i style="height: 34%"></i><i style="height: 70%"></i><i style="height: 46%"></i><i style="height: 84%"></i><i style="height: 59%"></i><i style="height: 91%"></i><i style="height: 42%"></i></div><p class="terminal-log"><span>+</span> refreshed from synthetic upstream / csv written</p><span class="preview-stamp">DNS / 02</span></div>`,
  },
  cyberkavach: {
    number: "03",
    name: "CyberKavach",
    category: "Club management system · scaffold",
    status: "Initial scaffold",
    stack: "PHP · MySQL · RBAC concepts",
    repo: "https://github.com/Erva-S/CyberKavach_task_Erva",
    summary: "A role-based platform concept for events, approval workflows, QR attendance, certificates, analytics, and collaboration.",
    objective: "Create a unified space for a technical club to manage its people, events, approvals, attendance, and generated certificates.",
    contribution: "The public README identifies an initial scaffold and planned modules including Router, Auth, RBAC, Audit, Approval, Events, Attendance, and Certificates. This portfolio does not claim those planned modules are complete.",
    decisions: "The project is represented as systems exploration: role-aware access, event workflows, QR attendance, and auditability are the useful organizing ideas visible in the public project description.",
    result: "Scaffold / planned work. The repository is useful evidence of the direction, but it is not presented as a finished production application.",
    previewClass: "preview-theme-cyber",
    preview: `<div class="preview-art preview-art--cyber"><aside><b>CK</b><span class="is-active"></span><span></span><span></span><span></span></aside><div class="cyber-board"><div class="cyber-board-top"><span>Club workspace</span><b>⌁</b></div><div class="cyber-board-stats"><div><small>ACCESS</small><strong>RBAC</strong></div><div><small>CHECK-IN</small><strong>QR</strong></div><div><small>FLOW</small><strong>WEB</strong></div></div><div class="cyber-board-list"><span><i></i> Approval workflow <b>PLANNED</b></span><span><i></i> Attendance <b>EXPLORING</b></span><span><i></i> Certificates <b>PLANNED</b></span></div></div><span class="preview-stamp">CK / 03</span></div>`,
  },
  planner: {
    number: "04",
    name: "Smart Study Planner",
    category: "C++ · object-oriented programming · CLI",
    status: "Completed academic project",
    stack: "C++ · OOP · vectors · menu-driven CLI",
    repo: "https://github.com/Erva-S/Cpp_Project",
    summary: "A focused command-line application for managing study tasks, tracking sessions, and calculating a productivity score.",
    objective: "Turn study tasks and sessions into a small, understandable productivity workflow using core object-oriented programming concepts.",
    contribution: "The repository README documents add, view, delete, and completion flows for study tasks, study-session tracking, and focus-score generation in a menu-driven CLI.",
    decisions: "A deliberately small command-line boundary keeps the project focused on OOP concepts, vectors, state changes, and a readable menu-driven interaction model.",
    result: "Completed academic project with a documented compile command and a clear scope around task management, session tracking, and productivity metrics.",
    previewClass: "preview-theme-planner",
    preview: `<div class="preview-art preview-art--planner"><div class="planner-ring"><strong>CLI</strong><small>object-oriented build</small></div><div class="planner-ticket"><small>ACADEMIC BUILD</small><b>Study planner</b><span>tasks · sessions · productivity</span></div><div class="planner-strokes"><i></i><i></i><i></i><i></i></div><span class="preview-stamp">C++ / 04</span></div>`,
  },
};

const orderedProjectIds = Object.keys(projects);

function updateScrollChrome() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${amount}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 30);
}

function closeMenu() {
  primaryNav.classList.remove("is-open");
  primaryNav.removeAttribute("data-open");
  pillNav?.setMenuOpen(false);
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
}

function selectProject(id) {
  const project = projects[id];
  if (!project) return;

  activeProjectId = id;
  projectButtons.forEach((button) => {
    const selected = button.dataset.projectId === id;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  preview.className = `project-preview ${project.previewClass}`;
  preview.innerHTML = project.preview;
  preview.setAttribute("aria-label", `${project.name} visual study preview`);
  stageTitle.textContent = project.name;
  stageCategory.textContent = project.category;
  stageStatus.textContent = project.status;
  stageOpen.dataset.openProject = id;
}

function detailFields(project) {
  document.querySelector("#detail-number").textContent = project.number;
  document.querySelector("#detail-status").textContent = project.status;
  document.querySelector("#detail-title").textContent = project.name;
  document.querySelector("#detail-summary").textContent = project.summary;
  document.querySelector("#detail-objective").textContent = project.objective;
  document.querySelector("#detail-contribution").textContent = project.contribution;
  document.querySelector("#detail-decisions").textContent = `${project.decisions} Stack: ${project.stack}.`;
  document.querySelector("#detail-result").textContent = project.result;
  document.querySelector("#detail-repo").href = project.repo;
  document.querySelector("#detail-art").className = `dialog-art ${project.previewClass}`;
  document.querySelector("#detail-art").innerHTML = project.preview;
  dialogInquiry.dataset.inquiryProject = activeProjectId;

  const liveLink = document.querySelector("#detail-live");
  liveLink.hidden = !project.live;
  if (project.live) liveLink.href = project.live;
}

function setInquiryContext(id = "") {
  if (inquiryProject) inquiryProject.value = id;
}

function setFormStatus(message, tone = "neutral") {
  formStatus.textContent = message;
  formStatus.dataset.tone = tone;
}

function validateInquiryForm() {
  const fields = [...inquiryForm.querySelectorAll("input, textarea")].filter((field) => field.name !== "_gotcha");
  let valid = true;

  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    const wrapper = field.closest(".form-field");
    wrapper?.querySelector(".field-error")?.remove();
    let message = "";

    if (field.required && !field.value.trim()) message = "Please fill in this field.";
    if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) message = "Please use a valid email address.";

    if (!message) return;
    valid = false;
    field.setAttribute("aria-invalid", "true");
    if (wrapper) {
      const error = document.createElement("small");
      error.className = "field-error";
      error.textContent = message;
      wrapper.append(error);
    }
  });

  return valid;
}

async function submitInquiry(event) {
  event.preventDefault();
  if (isSendingForm) return;
  setFormStatus("", "neutral");

  if (!validateInquiryForm()) {
    setFormStatus("Please fill in your name, email, and message.", "error");
    inquiryForm.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const fd = new FormData(inquiryForm);

  if (fd.get("_gotcha") || Date.now() - formStartedAt < 800) {
    setFormStatus("We could not send that message. Please try again.", "error");
    return;
  }

  // Straighten curly apostrophes in sender names
  for (const k of ["fi-sender-fullName", "fi-sender-firstName", "fi-sender-lastName"]) {
    const v = fd.get(k);
    if (typeof v === "string") fd.set(k, v.replace(/[\u2018\u2019]/g, "'"));
  }

  const submitButton = inquiryForm.querySelector("button[type=submit]");
  const submitLabel = submitButton.querySelector(".submit-label");
  isSendingForm = true;
  submitButton.disabled = true;
  submitLabel.textContent = "Sending…";
  setFormStatus("Sending your message…", "loading");

  try {
    if (!forminitInstance) forminitInstance = new Forminit();
    const { data, error } = await forminitInstance.submit(FORMINIT_FORM_ID, fd);

    if (error || typeof data?.hashId !== "string") {
      console.error("Forminit error:", error ?? data);
      setFormStatus(errorText(error), "error");
      return;
    }

    inquiryForm.reset();
    setFormStatus("Thank you! Your message has been sent. I'll get back to you soon.", "success");
  } catch (err) {
    console.error("Forminit error:", err);
    setFormStatus("Something went wrong. Please try again.", "error");
  } finally {
    isSendingForm = false;
    submitButton.disabled = false;
    submitLabel.textContent = "Send a message";
  }
}

function projectIdFromLocation() {
  const match = window.location.hash.match(/^#project\/(.+)$/);
  return match && projects[match[1]] ? match[1] : null;
}

function openProject(id, { push = true, focus = true } = {}) {
  const project = projects[id];
  if (!project) return;

  selectProject(id);
  detailFields(project);
  if (focus && !dialog.open) lastProjectFocus.element = document.activeElement;

  if (push && window.location.hash !== `#project/${id}`) {
    window.history.pushState({ project: id }, "", `#project/${id}`);
  }

  if (!dialog.open) dialog.showModal();
  if (focus) document.querySelector(".dialog-close").focus();
}

function closeProject() {
  if (!dialog.open) return;
  if (window.location.hash.startsWith("#project/") && window.history.state?.project) {
    window.history.back();
    return;
  }
  if (window.location.hash.startsWith("#project/")) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  dialog.close();
}

function syncProjectFromLocation() {
  const id = projectIdFromLocation();
  if (id) {
    openProject(id, { push: false, focus: true });
    return;
  }

  if (dialog.open) {
    closingFromHistory = true;
    dialog.close();
    closingFromHistory = false;
  }
}

function cycleProject(direction) {
  const currentIndex = orderedProjectIds.indexOf(activeProjectId);
  const nextIndex = (currentIndex + direction + orderedProjectIds.length) % orderedProjectIds.length;
  openProject(orderedProjectIds[nextIndex]);
}

window.addEventListener("scroll", updateScrollChrome, { passive: true });
updateScrollChrome();

menuToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!primaryNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

projectButtons.forEach((button, index) => {
  button.addEventListener("mouseenter", () => selectProject(button.dataset.projectId));
  button.addEventListener("focus", () => selectProject(button.dataset.projectId));
  button.addEventListener("click", () => openProject(button.dataset.projectId));
  button.addEventListener("keydown", (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowDown" ? (index + 1) % projectButtons.length : (index - 1 + projectButtons.length) % projectButtons.length;
    projectButtons[nextIndex].focus();
  });
});

stageOpen.addEventListener("click", () => openProject(stageOpen.dataset.openProject));
document.querySelector("[data-project-prev]").addEventListener("click", () => cycleProject(-1));
document.querySelector("[data-project-next]").addEventListener("click", () => cycleProject(1));
document.querySelector(".dialog-close").addEventListener("click", closeProject);
dialogInquiry.addEventListener("click", () => {
  const projectId = dialogInquiry.dataset.inquiryProject || activeProjectId;
  setInquiryContext(projectId);
  closeProject();
  window.setTimeout(() => {
    document.querySelector("#contact").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    (inquiryForm.elements["fi-sender-fullName"] || inquiryForm.elements.name)?.focus();
  }, reducedMotion ? 0 : 160);
});

inquiryForm.addEventListener("submit", submitInquiry);
inquiryForm.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    field.removeAttribute("aria-invalid");
    field.closest(".form-field")?.querySelector(".field-error")?.remove();
    if (formStatus.dataset.tone === "error") setFormStatus("", "neutral");
  });
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeProject();
});

dialog.addEventListener("close", () => {
  if (!closingFromHistory && window.location.hash.startsWith("#project/")) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  if (lastProjectFocus.element && document.contains(lastProjectFocus.element)) lastProjectFocus.element.focus();
});

window.addEventListener("popstate", syncProjectFromLocation);
window.addEventListener("hashchange", syncProjectFromLocation);
syncProjectFromLocation();
setInquiryContext("");

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: "0px 0px -8% 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* --- React Bits: PillNav Navigation Integration --- */
const pillNav = initPillNav("#primary-nav", {
  items: [
    { label: "Note", href: "#note" },
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Proof", href: "#proof" },
    { label: "Build", href: "#work-with-me" },
    { label: "Contact", href: "#contact" }
  ],
  defaultActiveIndex: 0,
  hoverEffect: "glide",
  indicator: "pill",
  bounce: 0.35,
  stretch: 0.45,
  intro: true,
  onItemClick: () => {
    closeMenu();
  }
});

window.pillNav = pillNav;

const sectionTargets = [
  { id: "note", index: 0 },
  { id: "work", index: 1 },
  { id: "about", index: 2 },
  { id: "proof", index: 3 },
  { id: "work-with-me", index: 4 },
  { id: "contact", index: 5 }
].map(item => ({ el: document.querySelector(`#${item.id}`), index: item.index })).filter(item => Boolean(item.el));

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const match = sectionTargets.find(t => t.el === entry.target);
      if (match && pillNav) {
        pillNav.setActive(match.index, true);
      }
    });
  }, { rootMargin: "-25% 0px -55% 0px", threshold: 0 });
  sectionTargets.forEach((target) => sectionObserver.observe(target.el));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    window.history.pushState(null, "", href);
  });
});

window.addEventListener("popstate", () => {
  const hash = window.location.hash;
  if (!hash) return;
  const match = sectionTargets.find(t => `#${t.el.id}` === hash);
  if (match && pillNav) {
    pillNav.setActive(match.index, true);
    match.el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }
});

if (window.location.hash) {
  const match = sectionTargets.find(t => `#${t.el.id}` === window.location.hash);
  if (match && pillNav) {
    pillNav.setActive(match.index, false);
  }
}

requestAnimationFrame(() => document.body.classList.add("is-ready"));

/* --- React Bits Pro: Luminous Type Engine (Hover Only) --- */
function initLuminousType() {
  const elements = document.querySelectorAll(".luminous-type");
  if (!elements.length) return;

  elements.forEach((el) => {
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let isHovered = false;
    let animId = null;
    let hoverStartTime = 0;
    let leaveTimer = null;

    const parent = el.closest(".wordmark") || el;

    function render(now) {
      if (!isHovered) {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
      } else {
        const elapsed = (now - hoverStartTime) / 1000;
        const driftOffset = Math.sin(elapsed * 2.2) * 8;
        const boundedX = Math.max(-10, Math.min(110, targetX + driftOffset));
        currentX += (boundedX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
      }

      el.style.setProperty("--spot-x", `${currentX.toFixed(2)}%`);
      el.style.setProperty("--spot-y", `${currentY.toFixed(2)}%`);

      if (isHovered || Math.abs(targetX - currentX) > 0.4) {
        animId = requestAnimationFrame(render);
      } else {
        animId = null;
      }
    }

    function startLoop() {
      if (!animId && !reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    }

    function onPointerEnter(e) {
      if (leaveTimer) clearTimeout(leaveTimer);
      isHovered = true;
      hoverStartTime = performance.now();
      parent.classList.add("is-luminous-active");

      const rect = el.getBoundingClientRect();
      if (rect.width && rect.height) {
        targetX = Math.max(-10, Math.min(110, ((e.clientX - rect.left) / rect.width) * 100));
        targetY = Math.max(-20, Math.min(120, ((e.clientY - rect.top) / rect.height) * 100));
        currentX = targetX;
        currentY = targetY;
        el.style.setProperty("--spot-x", `${currentX.toFixed(2)}%`);
        el.style.setProperty("--spot-y", `${currentY.toFixed(2)}%`);
      }
      startLoop();
    }

    function onPointerMove(e) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = Math.max(-10, Math.min(110, ((e.clientX - rect.left) / rect.width) * 100));
      targetY = Math.max(-20, Math.min(120, ((e.clientY - rect.top) / rect.height) * 100));
      if (!isHovered) {
        onPointerEnter(e);
      }
    }

    function onPointerLeave() {
      isHovered = false;
      parent.classList.remove("is-luminous-active");
      leaveTimer = setTimeout(() => {
        if (!isHovered && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }, 350);
    }

    parent.addEventListener("pointerenter", onPointerEnter, { passive: true });
    parent.addEventListener("pointermove", onPointerMove, { passive: true });
    parent.addEventListener("pointerleave", onPointerLeave, { passive: true });
  });
}

initLuminousType();

/* --- React Bits Pro: Cipher Reveal Engine (Hover Only for Hero Title) --- */
function initCipherReveal() {
  const title = document.querySelector(".hero-title.cipher-reveal");
  if (!title) return;

  const chars = Array.from(title.querySelectorAll(".cipher-char"));
  if (!chars.length) return;

  const CIPHER_GLYPHS = "0123456789ABCDEF!#$&*+-/<>?@[]~";
  let isAnimating = false;
  let animId = null;

  function cancelAndRestore() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (!isAnimating && !title.classList.contains("is-cipher-active")) {
      return;
    }
    isAnimating = false;
    title.classList.remove("is-cipher-active");
    chars.forEach((c) => {
      if (c.textContent !== c.dataset.orig) {
        c.textContent = c.dataset.orig;
      }
      c.classList.remove("is-scrambling");
      c.style.width = "";
      c.style.textAlign = "";
    });
  }

  function triggerCipher() {
    if (isAnimating) return;
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    isAnimating = true;
    title.classList.add("is-cipher-active");

    // Lock widths dynamically at current rendered size so scrambling never shifts layout
    const originalWidths = chars.map((c) => {
      const rect = c.getBoundingClientRect();
      return rect.width > 0 ? rect.width : null;
    });

    chars.forEach((c, i) => {
      if (originalWidths[i]) {
        c.style.width = `${originalWidths[i].toFixed(2)}px`;
        c.style.textAlign = "center";
      }
      c.classList.add("is-scrambling");
    });

    const startTime = performance.now();
    let lastGlyphUpdate = startTime;
    const charDelay = 26; // progressive cascade delay per character
    const baseDuration = 140; // minimum initial scramble duration

    function update(now) {
      const currentSel = window.getSelection();
      if (currentSel && currentSel.toString().trim().length > 0) {
        cancelAndRestore();
        return;
      }

      const elapsed = now - startTime;
      const shouldUpdateGlyphs = (now - lastGlyphUpdate) > 36;
      if (shouldUpdateGlyphs) {
        lastGlyphUpdate = now;
      }

      let allResolved = true;

      chars.forEach((c, i) => {
        const resolveTime = baseDuration + (i * charDelay);

        if (elapsed < resolveTime) {
          allResolved = false;
          if (shouldUpdateGlyphs) {
            const rand = CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
            c.textContent = rand;
          }
        } else {
          if (c.textContent !== c.dataset.orig) {
            c.textContent = c.dataset.orig;
            c.classList.remove("is-scrambling");
          }
        }
      });

      if (!allResolved) {
        animId = requestAnimationFrame(update);
      } else {
        cancelAndRestore();
      }
    }

    animId = requestAnimationFrame(update);
  }

  title.addEventListener("pointerenter", triggerCipher, { passive: true });
  title.addEventListener("pointerdown", cancelAndRestore, { passive: true });
  title.addEventListener("mousedown", cancelAndRestore, { passive: true });
  title.addEventListener("selectstart", cancelAndRestore, { passive: true });
}

initCipherReveal();

