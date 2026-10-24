const doc = document.documentElement;
doc.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const menuToggle = document.querySelector(".menu-toggle");
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
const formEndpoint = (import.meta.env.VITE_FORM_ENDPOINT || "").trim();
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
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
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
  const fields = [...inquiryForm.querySelectorAll("input, textarea")].filter((field) => field.name !== "website");
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
  setFormStatus("", "neutral");

  if (!validateInquiryForm()) {
    setFormStatus("Please fill in your name, email, and message.", "error");
    inquiryForm.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const honeypot = inquiryForm.elements.website;
  if (honeypot && (honeypot.value || Date.now() - formStartedAt < 800)) {
    setFormStatus("We could not send that message. Please try again.", "error");
    return;
  }

  if (!formEndpoint) {
    setFormStatus("The contact form is ready, but delivery is not configured yet. Add VITE_FORM_ENDPOINT (e.g. Formspree) in .env, or connect on GitHub.", "error");
    return;
  }

  const submitButton = inquiryForm.querySelector("button[type=submit]");
  const submitLabel = submitButton.querySelector(".submit-label");
  submitButton.disabled = true;
  submitLabel.textContent = "Sending…";
  setFormStatus("Sending your message…", "loading");

  const payload = Object.fromEntries(new FormData(inquiryForm).entries());
  delete payload.website;
  payload._subject = `Portfolio message from ${payload.name}`;

  try {
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Submission failed with ${response.status}`);
    inquiryForm.reset();
    setFormStatus("Thank you! Your message has been sent. I'll get back to you soon.", "success");
  } catch (error) {
    console.error(error);
    setFormStatus("The message could not be sent right now. Please connect on GitHub instead.", "error");
  } finally {
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
    inquiryForm.elements.name.focus();
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

const sectionTargets = [document.querySelector("#work"), document.querySelector("#about"), document.querySelector("#contact")].filter(Boolean);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
  sectionTargets.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", anchor.getAttribute("href"));
  });
});

requestAnimationFrame(() => document.body.classList.add("is-ready"));
