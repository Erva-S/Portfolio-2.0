import { Forminit } from "forminit";
import { initPillNav } from "./PillNav.js";
import { initScrollReveal } from "./ScrollReveal.js";

const doc = document.documentElement;
doc.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const menuToggle = document.querySelector(".pill-nav__toggle");
const primaryNav = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
let projectButtons = [];
const featuredProjectList = document.querySelector("#featured-project-list");
const dialog = document.querySelector("#project-dialog");
const preview = document.querySelector("#project-preview");
const stageTitle = document.querySelector("#stage-title");
const stageCategory = document.querySelector("#stage-category");
const stageActions = document.querySelector("#stage-actions");
const detailActions = document.querySelector("#detail-actions");
const inquiryForm = document.querySelector("#inquiry-form");
const formStatus = document.querySelector("#form-status");
const inquiryProject = document.querySelector("#inquiry-project");
const inquiryContext = document.querySelector("#inquiry-context");

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
let activeProjectId = "shreedutta";
let closingFromHistory = false;
let pillNav = null;
let currentActiveIndex = -1;
let activeSectionFrame = 0;
let navigationHasStarted = false;
let initialScrollY = window.scrollY || document.documentElement.scrollTop || 0;
let programmaticTargetIndex = null;
let initialAnchorPending = false;
let lockedScrollY = 0;
const bodyLockStyles = { position: "", top: "", width: "", overflow: "" };
let previousScrollBehavior = "";
let previousHistoryScrollRestoration = "auto";

const projects = {
  shreedutta: {
    number: "01",
    featured: true,
    name: "Shreedutta Clinic",
    meta: "MERN · clinic platform",
    category: "Clinic management platform · deployed",
    stack: "MongoDB · Express.js · React · Node.js · Tailwind CSS",
    live: "https://shreeduttaclinic.com/",
    summary: "A deployed MERN clinic platform for cardiology consultation, diagnostics, and appointment management.",
    objective: "Give the clinic a clear public presence while supporting appointment workflows and role-based dashboards for clinic operations.",
    contribution: "Built and deployed the responsive clinic website and its appointment-focused patient experience for a live client project.",
    decisions: "The interface leads with essential care information, direct appointment access, and a calm responsive layout that keeps the clinic easy to navigate.",
    result: "Deployed clinic website with appointment management and role-based clinic dashboards.",
    preview: {
      type: "image",
      orientation: "landscape",
      ratio: "standard",
      src: "/assets/previews/shreedutta-clinic.png",
      alt: "Shreedutta Clinic website homepage showing the clinic navigation, cardiology headline, and service imagery.",
      source: "Captured from the verified Shreedutta Clinic deployment.",
      note: "Authentic deployed website capture"
    },
  },
  revora: {
    number: "02",
    featured: true,
    name: "Revora AI Meeting Assistant",
    meta: "AI · meetings · context",
    category: "AI meeting assistant",
    stack: "MeetingBaaS · ElevenLabs · Gemini",
    summary: "An AI-powered meeting assistant that turns conversations into transcripts, summaries, action items, and durable project context.",
    objective: "Capture meeting information and carry decisions, open tasks, and relevant context forward across project conversations.",
    contribution: "The product combines Google Meet bot capture, MeetingBaaS recording and transcript workflows, ElevenLabs transcription, and Gemini-generated meeting follow-ups.",
    decisions: "Project-based organization keeps past decisions, action items, and meeting context available instead of isolating every conversation as a one-off record.",
    result: "No public repository or deployment is displayed; the project remains represented by its brief until an approved public destination or sanitized capture is available.",
    preview: {
      type: "image",
      orientation: "landscape",
      ratio: "wide",
      src: "/assets/previews/revora-dashboard.png",
      alt: "Revora AI Meeting Assistant interface showing transcription, meeting summaries, action items, and meeting tools.",
      source: "Supplied Revora dashboard screenshot.",
      note: "Authentic Revora interface capture"
    },
  },
  adhiraSih: {
    number: "03",
    featured: true,
    name: "Adhira — SIH Project",
    meta: "Flutter · SIH 2026",
    category: "Mobile scholarship platform · SIH",
    stack: "Flutter · Dart · Firebase · Gemini",
    summary: "A mobile scholarship platform that brings scheme discovery, guided applications, document readiness, tracking, and assistance into one student workflow.",
    objective: "Reduce fragmentation in scholarship applications for Scheduled Tribe students through a guided mobile experience.",
    contribution: "The application brings together scholarship discovery, document management, application tracking, notifications, and the JAGO assistant.",
    decisions: "A staged application flow and project-specific guidance keep complex scholarship requirements understandable on a mobile device.",
    result: "No public repository or deployment is displayed for this private project.",
    preview: {
      type: "image",
      orientation: "portrait",
      src: "/assets/previews/adhira-sih.png",
      alt: "Adhira SIH mobile application splash screen for the Ministry of Tribal Affairs scholarship platform.",
      source: "Supplied Adhira SIH mobile screenshot.",
      note: "Authentic mobile interface capture"
    },
  },
  adhiraTravel: {
    number: "04",
    featured: true,
    name: "Adhira — Travel Companion",
    meta: "Travel discovery · SERP hackathon",
    category: "Travel companion · discovery",
    stack: "SerpApi · travel discovery",
    summary: "A travel companion that brings flights, stays, places, and destination discovery into one planning experience.",
    objective: "Help travelers move from destination research to a more focused, useful trip-discovery workflow.",
    contribution: "The project connects travel search and discovery capabilities around flights, stays, places, and destination imagery.",
    decisions: "Search-led discovery keeps the experience practical: useful travel options and destination context stay close to the planning decision.",
    result: "No public repository or deployment is displayed for this private project.",
    preview: {
      type: "image",
      orientation: "landscape",
      ratio: "wide",
      src: "/assets/previews/adhira-travel.png",
      alt: "Adhira travel companion interface showing destination discovery and journey planning.",
      source: "Supplied Adhira travel platform screenshot.",
      note: "Authentic travel interface capture"
    },
  },
  aethera: {
    number: "05",
    featured: true,
    name: "Aethera — Travel Platform",
    meta: "React · travel platform",
    category: "Travel platform · Odoo hackathon",
    stack: "React 18 · TypeScript · Vite · Tailwind CSS",
    repo: "https://github.com/Erva-S/odoo-LDCE",
    summary: "A travel platform that brings destination discovery, itinerary planning, and in-destination journey context into one workspace.",
    objective: "Bring travel planning and live journey support together without losing the calm, editorial feel of the experience.",
    contribution: "The public project evidence documents the React, TypeScript, and Vite application architecture and its travel-workspace direction.",
    decisions: "A planning and live-mode split, destination context, local persistence, and a staged planner flow keep the product focused on the journey.",
    result: "Public repository available; no verified public deployment is claimed here.",
    preview: {
      type: "image",
      orientation: "landscape",
      ratio: "video",
      src: "/assets/previews/aethera-supplied.png",
      alt: "Aethera travel platform dashboard showing the current journey workspace.",
      source: "Supplied Aethera interface screenshot.",
      note: "Authentic travel platform capture"
    },
  },
};

const orderedProjectIds = Object.keys(projects);
const featuredProjectIds = orderedProjectIds.filter((id) => projects[id].featured);

function updateScrollChrome() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${amount}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 30);
  if (pillNav && Math.abs(window.scrollY - initialScrollY) > 1) navigationHasStarted = true;
  if (programmaticTargetIndex !== null && programmaticTargetReached()) finishProgrammaticNavigation();
  if (pillNav && navigationHasStarted) pillNav.replayActive(true);
  scheduleActiveSectionUpdate();
}

function renderPreview(target, project) {
  const isDialog = target.id === "detail-art";
  const baseClass = isDialog ? "dialog-art" : "project-preview";
  const preview = project.preview;
  const orientationClass = preview.orientation ? ` project-preview--${preview.orientation}` : "";
  const ratioClass = preview.ratio ? ` project-preview--ratio-${preview.ratio}` : "";
  target.className = `${baseClass} ${preview.type === "image" ? "project-preview--image" : "project-preview--fallback"}${orientationClass}${ratioClass}`;
  target.setAttribute("aria-label", preview.alt || `${project.name} preview`);

  if (preview.type === "image") {
    target.innerHTML = `<figure class="project-preview-media"><img src="${preview.src}" alt="${preview.alt}" /><figcaption>${preview.note}</figcaption></figure>`;
    const image = target.querySelector("img");
    image.addEventListener("error", () => {
      target.className = `${baseClass} project-preview--fallback`;
      target.innerHTML = `<div class="project-preview-fallback"><span>Preview unavailable</span><strong>${preview.note}</strong><small>${project.name} is still represented by its repository and project brief.</small></div>`;
    }, { once: true });
    return;
  }

  target.innerHTML = `<div class="project-preview-fallback"><span>Preview unavailable</span><strong>${preview.note}</strong><small>${project.name} is still represented by its project brief until a safe authentic capture is available.</small></div>`;
}

function destinationLinks(project, className) {
  const links = [];
  if (project.live) links.push(`<a class="${className}" href="${project.live}" target="_blank" rel="noreferrer">Open Live Link</a>`);
  if (project.repo) links.push(`<a class="${className}" href="${project.repo}" target="_blank" rel="noreferrer">View Repository</a>`);
  return links;
}

function renderStageActions(project, id) {
  stageActions.innerHTML = [
    ...destinationLinks(project, "stage-destination"),
    `<button class="stage-open" type="button" data-open-project="${id}">Open brief</button>`
  ].join("");
}

function renderDetailActions(project, id) {
  detailActions.innerHTML = [
    ...destinationLinks(project, "detail-destination"),
    `<button class="dialog-inquiry" type="button" data-inquiry-project="${id}">Discuss a similar project</button>`
  ].join("");
}

function renderFeaturedProjects() {
  if (!featuredProjectList) return;
  featuredProjectList.innerHTML = featuredProjectIds.map((id) => {
    const project = projects[id];
    return `<button class="project-item" type="button" data-project-id="${id}" aria-pressed="false"><span class="project-index-number">${project.number}</span><span class="project-index-name">${project.name}</span><span class="project-index-meta">${project.meta}</span></button>`;
  }).join("");
  projectButtons = [...featuredProjectList.querySelectorAll("[data-project-id]")];
  projectButtons.forEach((button, index) => {
    button.addEventListener("mouseenter", () => selectProject(button.dataset.projectId));
    button.addEventListener("focus", () => selectProject(button.dataset.projectId));
    button.addEventListener("click", () => openProject(button.dataset.projectId));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "ArrowDown" ? (index + 1) % projectButtons.length : (index - 1 + projectButtons.length) % projectButtons.length;
      projectButtons[nextIndex].focus();
    });
  });
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
  if (!project?.featured) return;

  activeProjectId = id;
  projectButtons.forEach((button) => {
    const selected = button.dataset.projectId === id;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  renderPreview(preview, project);
  stageTitle.textContent = project.name;
  stageCategory.textContent = project.category;
  renderStageActions(project, id);
}

function detailFields(project) {
  document.querySelector("#detail-number").textContent = project.number;
  document.querySelector("#detail-title").textContent = project.name;
  document.querySelector("#detail-summary").textContent = project.summary;
  document.querySelector("#detail-objective").textContent = project.objective;
  document.querySelector("#detail-contribution").textContent = project.contribution;
  document.querySelector("#detail-decisions").textContent = `${project.decisions} Stack: ${project.stack}.`;
  document.querySelector("#detail-result").textContent = project.result;
  renderPreview(document.querySelector("#detail-art"), project);
  renderDetailActions(project, activeProjectId);
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
  return match && projects[match[1]]?.featured ? match[1] : null;
}

function lockPageScroll() {
  if (document.body.classList.contains("modal-open")) return;
  lockedScrollY = window.scrollY;
  bodyLockStyles.position = document.body.style.position;
  bodyLockStyles.top = document.body.style.top;
  bodyLockStyles.width = document.body.style.width;
  bodyLockStyles.overflow = document.body.style.overflow;
  previousScrollBehavior = doc.style.scrollBehavior;
  previousHistoryScrollRestoration = window.history.scrollRestoration;
  doc.style.scrollBehavior = "auto";
  window.history.scrollRestoration = "manual";
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  document.body.classList.add("modal-open");
}

function unlockPageScroll() {
  if (!document.body.classList.contains("modal-open")) return;
  const restoreY = lockedScrollY;
  document.body.classList.remove("modal-open");
  document.body.style.position = bodyLockStyles.position;
  document.body.style.top = bodyLockStyles.top;
  document.body.style.width = bodyLockStyles.width;
  document.body.style.overflow = bodyLockStyles.overflow;
  const startedAt = performance.now();
  const restore = () => {
    window.scrollTo({ left: 0, top: restoreY, behavior: "auto" });
    if (performance.now() - startedAt < 600) {
      window.requestAnimationFrame(restore);
      return;
    }
    doc.style.scrollBehavior = previousScrollBehavior;
    window.history.scrollRestoration = previousHistoryScrollRestoration;
  };
  restore();
}

function openProject(id, { push = true, focus = true } = {}) {
  const project = projects[id];
  if (!project?.featured) return;

  selectProject(id);
  detailFields(project);
  if (focus && !dialog.open) lastProjectFocus.element = document.activeElement;

  if (push && window.location.hash !== `#project/${id}`) {
    window.history.pushState({ project: id }, "", `#project/${id}`);
  }

  if (!dialog.open) {
    lockPageScroll();
    dialog.showModal();
  }
  if (focus) document.querySelector(".dialog-close").focus();
}

function closeProject() {
  if (!dialog.open) return;
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
  const currentIndex = featuredProjectIds.indexOf(activeProjectId);
  const nextIndex = (currentIndex + direction + featuredProjectIds.length) % featuredProjectIds.length;
  openProject(featuredProjectIds[nextIndex]);
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

renderFeaturedProjects();
selectProject(activeProjectId);

stageActions.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-project]");
  if (openButton) openProject(openButton.dataset.openProject);
});
document.querySelector("[data-project-prev]").addEventListener("click", () => cycleProject(-1));
document.querySelector("[data-project-next]").addEventListener("click", () => cycleProject(1));
document.querySelector(".dialog-close").addEventListener("click", closeProject);

inquiryForm.addEventListener("submit", submitInquiry);
inquiryForm.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    field.removeAttribute("aria-invalid");
    field.closest(".form-field")?.querySelector(".field-error")?.remove();
    if (formStatus.dataset.tone === "error") setFormStatus("", "neutral");
  });
});

dialog.addEventListener("click", (event) => {
  const inquiry = event.target.closest("[data-inquiry-project]");
  if (inquiry) {
    const projectId = inquiry.dataset.inquiryProject || activeProjectId;
    setInquiryContext(projectId);
    closeProject();
    window.setTimeout(() => {
      document.querySelector("#contact").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      (inquiryForm.elements["fi-sender-fullName"] || inquiryForm.elements.name)?.focus();
    }, reducedMotion ? 0 : 160);
    return;
  }
  if (event.target === dialog) closeProject();
});

dialog.addEventListener("close", () => {
  const restoreY = lockedScrollY;
  unlockPageScroll();
  if (!closingFromHistory && window.location.hash.startsWith("#project/")) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  if (lastProjectFocus.element && document.contains(lastProjectFocus.element)) lastProjectFocus.element.focus({ preventScroll: true });
  window.setTimeout(() => window.scrollTo({ left: 0, top: restoreY, behavior: "auto" }), 80);
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
    { label: "Workbench", href: "#workbench" },
    { label: "About", href: "#about" },
    { label: "Proof", href: "#proof" },
    { label: "Build", href: "#work-with-me" },
    { label: "Connect", href: "#contact" }
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
  { id: "workbench", index: 2, label: "Workbench" },
  { id: "about", index: 3, label: "About" },
  { id: "proof", index: 4, label: "Proof" },
  { id: "work-with-me", index: 5, label: "Build" },
  { id: "contact", index: 6, label: "Connect" }
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
  initialAnchorPending = false;
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
    initialAnchorPending = false;
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
  initialAnchorPending = false;
  const hash = window.location.hash;
  if (!hash || hash === "#top") {
    navigationHasStarted = true;
    programmaticTargetIndex = 0;
    currentActiveIndex = 0;
    pillNav?.setActive(0, true);
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
    return;
  }
  const match = sectionTargets.find(t => `#${t.id}` === hash);
  if (match && pillNav) {
    navigationHasStarted = true;
    programmaticTargetIndex = match.index;
    currentActiveIndex = match.index;
    pillNav.setActive(match.index, true);
    match.el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    scheduleActiveSectionUpdate();
  }
});

// Section URLs select their matching item immediately. Without an anchor,
// the first real scroll or navigation opts into continuous section tracking.
function initStartingNavigation() {
  const initialHash = window.location.hash;
  const match = sectionTargets.find(t => `#${t.id}` === initialHash);
  if (match && pillNav) {
    navigationHasStarted = true;
    currentActiveIndex = match.index;
    pillNav.setActive(match.index, false);
    initialAnchorPending = true;

    // Fonts and generated content can move a native fragment landing on a cold
    // load. Settle it once the layout is ready, unless the user has navigated.
    const pageLoaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));
    pageLoaded.then(() => document.fonts.ready).then(() => {
      if (!initialAnchorPending || window.location.hash !== initialHash || dialog.open) return;
      initialAnchorPending = false;
      if (match.index === 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else {
        match.el.scrollIntoView({ behavior: "instant", block: "start" });
      }
      currentActiveIndex = match.index;
      pillNav.setActive(match.index, false);
      scheduleActiveSectionUpdate();
    });
    return;
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

window.addEventListener("pagehide", () => {
  scrollRevealInstances.forEach((instance) => instance.destroy());
});
