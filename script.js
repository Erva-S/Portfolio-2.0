import { Forminit } from "forminit";
import { initPillNav } from "./PillNav.js";
import { initFoldText } from "./FoldText.js";
import { initScrollReveal } from "./ScrollReveal.js";

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
let pillNav = null;
let currentActiveIndex = -1;
let activeSectionFrame = 0;
let navigationHasStarted = false;
let initialScrollY = window.scrollY || document.documentElement.scrollTop || 0;
let programmaticTargetIndex = null;
let preserveInitialUnselected = window.location.hash === "#note";

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
  if (pillNav && !preserveInitialUnselected && Math.abs(window.scrollY - initialScrollY) > 1) navigationHasStarted = true;
  if (programmaticTargetIndex !== null && programmaticTargetReached()) finishProgrammaticNavigation();
  if (pillNav && navigationHasStarted) pillNav.replayActive(true);
  scheduleActiveSectionUpdate();
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
window.addEventListener("resize", () => {
  updateScrollChrome();
  pillNav?.refresh();
}, { passive: true });
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

const scrollRevealInstances = [...document.querySelectorAll("[data-scroll-reveal]")]
  .map((element) => initScrollReveal(element, {
    enableBlur: true,
    baseOpacity: 0.16,
    baseRotation: 0,
    blurStrength: 2.5,
    baseOffset: 0,
    stagger: 0.045,
    smoothing: 0.12,
    splitBy: "words",
    effect: "fade",
    mode: "scrub",
    duration: 0.8,
    rotationEnd: "bottom bottom",
    wordAnimationEnd: "bottom bottom"
  }))
  .filter(Boolean);

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
pillNav = initPillNav("#primary-nav", {
  items: [
    { label: "Home", href: "#top" },
    { label: "Note", href: "#note" },
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Proof", href: "#proof" },
    { label: "Build", href: "#work-with-me" },
    { label: "Contact", href: "#contact" }
  ],
  defaultActiveIndex: -1,
  hoverEffect: "fill",
  indicator: "pill",
  bounce: 0.35,
  stretch: 0.45,
  intro: false,
  onItemClick: () => {
    closeMenu();
  }
});

window.pillNav = pillNav;

const sectionTargets = [
  { id: "top", index: 0, label: "Home" },
  { id: "note", index: 1, label: "Note" },
  { id: "work", index: 2, label: "Work" },
  { id: "about", index: 3, label: "About" },
  { id: "proof", index: 4, label: "Proof" },
  { id: "work-with-me", index: 5, label: "Build" },
  { id: "contact", index: 6, label: "Contact" }
].map(item => ({ ...item, el: document.querySelector(`#${item.id}`) })).filter(item => Boolean(item.el));

function programmaticTargetReached() {
  const target = sectionTargets[programmaticTargetIndex];
  if (!target) return false;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (target.index === 0) return window.scrollY <= 1;
  if (target.index === sectionTargets.length - 1) return window.scrollY >= scrollable - 1;

  const scrollMarginTop = parseFloat(getComputedStyle(target.el).scrollMarginTop) || 0;
  return Math.abs(target.el.getBoundingClientRect().top - scrollMarginTop) <= 2;
}

function determineActiveSection() {
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportH = window.innerHeight || 800;
  const scrollable = document.documentElement.scrollHeight - viewportH;

  // 1. Top of the page (Hero section)
  if (scrollY <= 80) {
    return 0; // Home
  }

  // 2. Bottom of the page (Contact section)
  if (scrollable > 0 && scrollY >= scrollable - 45) {
    return 6; // Contact
  }

  // 3. Focal line detection: positioned comfortably below the fixed header
  // Fixed header bottom is ~72px; sections have scroll-margin-top: clamp(80px, 10vh, 105px).
  // A focal threshold between 110px and 140px ensures accurate detection of visible section.
  const focalLine = Math.min(140, Math.max(95, viewportH * 0.16));

  for (let i = sectionTargets.length - 1; i >= 0; i--) {
    const target = sectionTargets[i];
    const rect = target.el.getBoundingClientRect();
    if (rect.top <= focalLine + 4 && rect.bottom > focalLine) {
      return target.index;
    }
  }

  // Fallback: choose section with highest viewport coverage
  let bestIndex = 0;
  let maxVisible = -1;
  sectionTargets.forEach(target => {
    const rect = target.el.getBoundingClientRect();
    const visibleH = Math.max(0, Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0));
    if (visibleH > maxVisible) {
      maxVisible = visibleH;
      bestIndex = target.index;
    }
  });

  return bestIndex;
}

function updateActiveSection(animate = true) {
  if (!pillNav || !navigationHasStarted || programmaticTargetIndex !== null) return;

  const nextIdx = determineActiveSection();
  if (nextIdx !== currentActiveIndex) {
    currentActiveIndex = nextIdx;
    pillNav.setActive(nextIdx, animate);
  }
}

function scheduleActiveSectionUpdate() {
  if (activeSectionFrame || !pillNav || !navigationHasStarted || programmaticTargetIndex !== null) return;
  activeSectionFrame = requestAnimationFrame(() => {
    activeSectionFrame = 0;
    updateActiveSection(true);
  });
}

function cancelProgrammaticNavigation() {
  if (programmaticTargetIndex === null) return;
  programmaticTargetIndex = null;
  scheduleActiveSectionUpdate();
}

function finishProgrammaticNavigation() {
  if (programmaticTargetIndex === null) return;
  programmaticTargetIndex = null;
  scheduleActiveSectionUpdate();
}

// Any real navigation input removes the initial unselected state. The scroll
// handler also detects scrollbar/programmatic movement, so tracking has one
// continuous source of truth regardless of how the page moved.
const markNavigationStarted = () => {
  preserveInitialUnselected = false;
  cancelProgrammaticNavigation();
  if (navigationHasStarted) return;
  navigationHasStarted = true;
  scheduleActiveSectionUpdate();
};
window.addEventListener("wheel", markNavigationStarted, { passive: true });
window.addEventListener("touchmove", markNavigationStarted, { passive: true });
window.addEventListener("pointerdown", cancelProgrammaticNavigation, { passive: true });
window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space", "Home", "End"].includes(e.key)) {
    markNavigationStarted();
  }
}, { passive: true });
if ("onscrollend" in window) window.addEventListener("scrollend", finishProgrammaticNavigation, { passive: true });

// Smooth anchor navigation without overshoot or conflicts
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    closeMenu();
    preserveInitialUnselected = false;
    navigationHasStarted = true;

    const match = sectionTargets.find(t => `#${t.id}` === href);
    programmaticTargetIndex = match ? match.index : null;
    if (match && pillNav) {
      currentActiveIndex = match.index;
      pillNav.setActive(match.index, true);
    }

    if (href === "#top") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    } else {
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    }

    window.history.pushState(null, "", href);
    scheduleActiveSectionUpdate();
  });
});

window.addEventListener("popstate", () => {
  const hash = window.location.hash;
  if (!hash || hash === "#top") {
    preserveInitialUnselected = false;
    navigationHasStarted = true;
    programmaticTargetIndex = 0;
    currentActiveIndex = 0;
    pillNav?.setActive(0, true);
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
    return;
  }
  const match = sectionTargets.find(t => `#${t.id}` === hash);
  if (match && pillNav) {
    preserveInitialUnselected = false;
    navigationHasStarted = true;
    programmaticTargetIndex = match.index;
    currentActiveIndex = match.index;
    pillNav.setActive(match.index, true);
    match.el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    scheduleActiveSectionUpdate();
  }
});

// Keep the initial navigation state unselected. The first real scroll or
// anchor navigation opts into continuous section tracking.
function initStartingNavigation() {
  if (window.location.hash) {
    if (window.location.hash === "#top") {
      navigationHasStarted = true;
      currentActiveIndex = 0;
      pillNav?.setActive(0, false);
      return;
    }
    if (window.location.hash === "#note") {
      preserveInitialUnselected = true;
      navigationHasStarted = false;
      currentActiveIndex = -1;
      pillNav?.setActive(-1, false);
      return;
    }
    const match = sectionTargets.find(t => `#${t.id}` === window.location.hash);
    if (match && pillNav) {
      preserveInitialUnselected = false;
      navigationHasStarted = true;
      currentActiveIndex = match.index;
      pillNav.setActive(match.index, false);
      return;
    }
  }

  currentActiveIndex = -1;
  navigationHasStarted = false;
  pillNav?.setActive(-1, false);
}

initStartingNavigation();

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

/* --- React Bits: FoldText Engine (Hover-Triggered for Hero Title) --- */
const heroFold = initFoldText("#hero-title", {
  text: "building my way up.",
  hinge: "top",
  trigger: "hover",
  duration: 0.72,
  foldDuration: 0.22,
  unfoldDuration: 0.52,
  stagger: 0.022,
  staggerFrom: "start",
  foldAngle: 90,
  ease: "power3.out",
  perspective: 900,
  creaseShading: 0.42
});

window.addEventListener("pagehide", () => {
  heroFold?.destroy();
  scrollRevealInstances.forEach((instance) => instance.destroy());
});
