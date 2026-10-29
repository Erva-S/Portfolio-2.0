import { Forminit } from "forminit";

const doc = document.documentElement;
doc.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const navToggle = document.querySelector("#nav-toggle");
const primaryNav = document.querySelector("#primary-nav");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const dialog = document.querySelector("#project-dialog");
const inquiryForm = document.querySelector("#inquiry-form");
const formStatus = document.querySelector("#form-status");
const inquiryProject = document.querySelector("#inquiry-project");
const backToTopBtn = document.querySelector("#back-to-top");

// Forminit config
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
let activeProjectId = "revora";
let closingFromHistory = false;
let navigationHasStarted = false;
const initialScrollY = window.scrollY || document.documentElement.scrollTop || 0;
let lockedScrollY = 0;
const bodyLockStyles = { position: "", top: "", width: "", overflow: "" };
let previousScrollBehavior = "";
let previousHistoryScrollRestoration = "auto";

/* --- Projects Catalog --- */
const projects = {
  revora: {
    number: "01",
    featured: true,
    name: "Revora AI Meeting Assistant",
    meta: "AI · meetings · context",
    category: "AI meeting assistant",
    stack: "MeetingBaaS · ElevenLabs · Gemini",
    repo: "https://github.com/Erva-S/revora-ai",
    summary: "An AI-powered meeting assistant that turns conversations into transcripts, summaries, action items, and durable project context.",
    objective: "Capture meeting information and carry decisions, open tasks, and relevant context forward across project conversations.",
    contribution: "The product combines Google Meet bot capture, MeetingBaaS recording and transcript workflows, ElevenLabs transcription, and Gemini-generated meeting follow-ups.",
    decisions: "Project-based organization keeps past decisions, action items, and meeting context available instead of isolating every conversation as a one-off record.",
    result: "Public repository available; open-source AI meeting assistant workflows and integrations.",
    preview: {
      type: "image",
      src: "/assets/previews/revora-dashboard.png",
      alt: "Revora AI Meeting Assistant interface showing transcription, meeting summaries, and action items.",
      note: "Authentic Revora interface capture"
    }
  },
  shreedutta: {
    number: "02",
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
      src: "/assets/previews/shreedutta-clinic.png",
      alt: "Shreedutta Clinic website homepage showing the clinic navigation, cardiology headline, and service imagery.",
      note: "Authentic deployed website capture"
    }
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
      src: "/assets/previews/adhira-sih.png",
      alt: "Adhira SIH mobile application splash screen for the Ministry of Tribal Affairs scholarship platform.",
      note: "Authentic mobile interface capture"
    }
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
      src: "/assets/previews/adhira-travel.png",
      alt: "Adhira travel companion interface showing destination discovery and journey planning.",
      note: "Authentic travel interface capture"
    }
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
      src: "/assets/previews/aethera-supplied.png",
      alt: "Aethera travel platform dashboard showing the current journey workspace.",
      note: "Authentic travel platform capture"
    }
  }
};

const projectKeys = Object.keys(projects);

/* --- Scroll Progress & Active Navigation Tracking --- */
const sectionTargets = [
  { id: "note", el: document.querySelector("#note") },
  { id: "work", el: document.querySelector("#work") },
  { id: "about", el: document.querySelector("#about") },
  { id: "proof", el: document.querySelector("#proof") },
  { id: "build", el: document.querySelector("#build") },
  { id: "connect", el: document.querySelector("#connect") }
].filter(item => Boolean(item.el));

function updateScrollChrome() {
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${amount}%`;

  // Only start marking navigation active after the user has begun scrolling (prompt req 5)
  if (!navigationHasStarted && Math.abs(scrollY - initialScrollY) > 20) {
    navigationHasStarted = true;
  }

  if (navigationHasStarted) {
    updateActiveNav();
  }
}

function updateActiveNav() {
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportH = window.innerHeight || 800;
  const scrollable = document.documentElement.scrollHeight - viewportH;

  // If at very top, no section link is active
  if (scrollY < 120) {
    navLinks.forEach(link => link.classList.remove("is-active"));
    return;
  }

  // If near the bottom, connect section is active
  if (scrollable > 0 && scrollY >= scrollable - 80) {
    setActiveNavLink("connect");
    return;
  }

  // Focal line: roughly 25% down the viewport
  const focalPoint = viewportH * 0.28;
  let currentActiveId = null;

  for (let i = sectionTargets.length - 1; i >= 0; i--) {
    const target = sectionTargets[i];
    const rect = target.el.getBoundingClientRect();
    if (rect.top <= focalPoint && rect.bottom > focalPoint) {
      currentActiveId = target.id;
      break;
    }
  }

  if (currentActiveId) {
    setActiveNavLink(currentActiveId);
  }
}

function setActiveNavLink(sectionId) {
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const matches = href === `#${sectionId}` || (sectionId === "work" && href === "#workbench") || (sectionId === "build" && href === "#work-with-me") || (sectionId === "connect" && href === "#contact");
    link.classList.toggle("is-active", matches);
  });
}

function closeMenu() {
  if (primaryNav) primaryNav.classList.remove("is-open");
  if (navToggle) navToggle.setAttribute("aria-expanded", "false");
}

/* --- Project Brief Modal Rendering --- */
function renderPreview(target, project) {
  if (!target) return;
  const preview = project.preview;
  
  if (preview && preview.type === "image" && preview.src) {
    const isPortrait = preview.orientation === "portrait" || (project.name && project.name.includes("SIH"));
    target.className = `dialog-art project-preview--image ${isPortrait ? "is-portrait" : "is-landscape"}`;
    target.innerHTML = `
      <div class="dialog-mockup-frame">
        <div class="dialog-mockup-bar">
          <div class="mockup-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <span class="mockup-label">${preview.note || project.name}</span>
          <span class="mockup-resolution">${isPortrait ? "MOBILE INTERFACE" : "AUTHENTIC DASHBOARD"}</span>
        </div>
        <div class="dialog-mockup-screen">
          <img src="${preview.src}" alt="${preview.alt || project.name}" loading="eager" />
        </div>
        <div class="dialog-mockup-footer">
          <span>${project.category}</span>
          <a class="dialog-full-img-link" href="${preview.src}" target="_blank" rel="noreferrer">Open full-resolution image ↗</a>
        </div>
      </div>
    `;
    const img = target.querySelector("img");
    img.addEventListener("error", () => {
      target.className = "dialog-art project-preview--fallback";
      target.innerHTML = `<div class="project-preview-fallback"><span>PREVIEW UNAVAILABLE</span><strong>${preview.note || project.name}</strong><small>${project.name} is represented by its technical brief and architecture records.</small></div>`;
    }, { once: true });
    return;
  }

  target.className = "dialog-art project-preview--fallback";
  target.innerHTML = `<div class="project-preview-fallback"><span>PROJECT ARCHIVE</span><strong>${project.name}</strong><small>${project.stack} · ${project.category}</small></div>`;
}

function destinationLinks(project, className) {
  const links = [];
  if (project.live) links.push(`<a class="${className}" href="${project.live}" target="_blank" rel="noreferrer">Open Live Link</a>`);
  if (project.repo) links.push(`<a class="${className}" href="${project.repo}" target="_blank" rel="noreferrer">View Repository</a>`);
  return links;
}

function renderDetailActions(project, id) {
  const detailActions = document.querySelector("#detail-actions");
  if (!detailActions) return;
  detailActions.innerHTML = [
    ...destinationLinks(project, "btn-brutalist btn-brutalist--outline"),
    `<button class="btn-brutalist btn-brutalist--lime dialog-inquiry" type="button" data-inquiry-project="${id}">Discuss similar build</button>`
  ].join("");
}

function detailFields(project) {
  const numEl = document.querySelector("#detail-number");
  const titleEl = document.querySelector("#detail-title");
  const summaryEl = document.querySelector("#detail-summary");
  const objEl = document.querySelector("#detail-objective");
  const contEl = document.querySelector("#detail-contribution");
  const decEl = document.querySelector("#detail-decisions");
  const resEl = document.querySelector("#detail-result");

  if (numEl) numEl.textContent = project.number;
  if (titleEl) titleEl.textContent = project.name;
  if (summaryEl) summaryEl.textContent = project.summary;
  if (objEl) objEl.textContent = project.objective;
  if (contEl) contEl.textContent = project.contribution;
  if (decEl) decEl.textContent = `${project.decisions} Stack: ${project.stack}.`;
  if (resEl) resEl.textContent = project.result;

  renderPreview(document.querySelector("#detail-art"), project);
  renderDetailActions(project, activeProjectId);
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
  window.scrollTo({ left: 0, top: restoreY, behavior: "auto" });
  doc.style.scrollBehavior = previousScrollBehavior;
  window.history.scrollRestoration = previousHistoryScrollRestoration;
}

function openProject(id, { push = true, focus = true } = {}) {
  const project = projects[id];
  if (!project) return;

  activeProjectId = id;
  detailFields(project);
  if (focus && !dialog.open) lastProjectFocus.element = document.activeElement;

  if (push && window.location.hash !== `#project/${id}`) {
    window.history.pushState({ project: id }, "", `#project/${id}`);
  }

  if (!dialog.open) {
    lockPageScroll();
    dialog.showModal();
  }
  if (focus) {
    const closeBtn = document.querySelector(".dialog-close");
    if (closeBtn) closeBtn.focus();
  }
}

function closeProject() {
  if (!dialog.open) return;
  if (window.location.hash.startsWith("#project/")) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  dialog.close();
}

function cycleProject(direction) {
  const currentIndex = projectKeys.indexOf(activeProjectId);
  const nextIndex = (currentIndex + direction + projectKeys.length) % projectKeys.length;
  openProject(projectKeys[nextIndex]);
}

function projectIdFromLocation() {
  const match = window.location.hash.match(/^#project\/(.+)$/);
  return match && projects[match[1]] ? match[1] : null;
}

function syncProjectFromLocation() {
  const id = projectIdFromLocation();
  if (id) {
    openProject(id, { push: false, focus: true });
    return;
  }
  if (dialog && dialog.open) {
    closingFromHistory = true;
    dialog.close();
    closingFromHistory = false;
  }
}

/* --- Forminit Contact Form Handling --- */
function setFormStatus(message, tone = "neutral") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.tone = tone;
}

function setInquiryContext(id = "") {
  if (inquiryProject) inquiryProject.value = id;
}

function validateInquiryForm() {
  const fields = [...inquiryForm.querySelectorAll("input, textarea")].filter((field) => field.name !== "_gotcha");
  let valid = true;

  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    const wrapper = field.closest(".form-field-label");
    wrapper?.querySelector(".field-error")?.remove();
    let message = "";

    if (field.required && !field.value.trim()) message = "Please fill in this field.";
    if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      message = "Please enter a valid email address.";
    }

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
    setFormStatus("Could not verify submission. Please try again.", "error");
    return;
  }

  // Normalize curly apostrophes
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

/* --- Scroll Entrance Reveals (IntersectionObserver) --- */
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else if (entry.boundingClientRect.top > (window.innerHeight || 800)) {
        // Allow repeated reveal when scrolling back up and down
        entry.target.classList.remove("is-visible");
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

/* --- Hero Interactive Object Disruption --- */
const heroObject = document.querySelector("#hero-interactive-object");
if (heroObject) {
  heroObject.addEventListener("click", () => {
    heroObject.animate([
      { transform: "rotate(-3deg) scale(0.98)" },
      { transform: "rotate(4deg) scale(1.02)" },
      { transform: "rotate(-1deg) scale(1)" }
    ], { duration: 350, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
  });
}

/* --- Event Listeners Setup --- */
window.addEventListener("scroll", updateScrollChrome, { passive: true });
window.addEventListener("resize", updateScrollChrome, { passive: true });
updateScrollChrome();

// Navigation toggle
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Nav links click
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    closeMenu();
    navigationHasStarted = true;
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId) {
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        setActiveNavLink(targetId);
      }
    }
  });
});

// Back to top button
if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    navLinks.forEach(link => link.classList.remove("is-active"));
  });
}

// Global project opening triggers (delegation)
document.addEventListener("click", (event) => {
  const openBtn = event.target.closest("[data-open-project]");
  if (openBtn) {
    const projectId = openBtn.dataset.openProject;
    if (projectId) openProject(projectId);
  }
});

// Keyboard accessibility for dashboard previews
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    const openBtn = event.target.closest("[data-open-project]");
    if (openBtn && openBtn.getAttribute("role") === "button") {
      event.preventDefault();
      const projectId = openBtn.dataset.openProject;
      if (projectId) openProject(projectId);
    }
  }
});

// Dialog controls
const prevBtn = document.querySelector("[data-project-prev]");
const nextBtn = document.querySelector("[data-project-next]");
const closeBtn = document.querySelector(".dialog-close");

if (prevBtn) prevBtn.addEventListener("click", () => cycleProject(-1));
if (nextBtn) nextBtn.addEventListener("click", () => cycleProject(1));
if (closeBtn) closeBtn.addEventListener("click", closeProject);

if (dialog) {
  dialog.addEventListener("click", (event) => {
    const inquiry = event.target.closest("[data-inquiry-project]");
    if (inquiry) {
      const projectId = inquiry.dataset.inquiryProject || activeProjectId;
      setInquiryContext(projectId);
      closeProject();
      window.setTimeout(() => {
        document.querySelector("#connect")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        inquiryForm?.querySelector('input[name="fi-sender-fullName"]')?.focus();
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
    if (lastProjectFocus.element && document.contains(lastProjectFocus.element)) {
      lastProjectFocus.element.focus({ preventScroll: true });
    }
    window.setTimeout(() => window.scrollTo({ left: 0, top: restoreY, behavior: "auto" }), 80);
  });
}

// History popstate/hashchange
window.addEventListener("popstate", syncProjectFromLocation);
window.addEventListener("hashchange", syncProjectFromLocation);
syncProjectFromLocation();
setInquiryContext("");

// Forminit form submit and validation events
if (inquiryForm) {
  inquiryForm.addEventListener("submit", submitInquiry);
  inquiryForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      field.removeAttribute("aria-invalid");
      field.closest(".form-field-label")?.querySelector(".field-error")?.remove();
      if (formStatus && formStatus.dataset.tone === "error") setFormStatus("", "neutral");
    });
  });
}
