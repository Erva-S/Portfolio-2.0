# Erva Savaliya — Signature Portfolio

A static, editorial portfolio for Erva Savaliya, built from scratch with semantic HTML, CSS, and vanilla JavaScript.

## Run locally

Install dependencies once:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually [http://localhost:5173](http://localhost:5173).

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Structure

- `index.html` — page structure, content, metadata, and verified project links.
- `styles.css` — design tokens, responsive layouts, typographic project index, detail dialog, visual studies, and motion styles.
- `script.js` — navigation, project preview selection, URL/hash history, accessible project detail views, scroll progress, reveal choreography, and reduced-motion handling.
- `favicon.svg` — minimal ES monogram favicon.

## Content notes

The project links currently point to public GitHub repositories under `Erva-S`:

- `odoo-LDCE` / Aethera travel workspace
- `dns-cache-analysis`
- `CyberKavach_task_Erva`
- `Cpp_Project` / Smart Study Planner

The project index uses CSS-built visual studies because the current portfolio directory does not contain authenticated project screenshots or image assets. These previews are intentionally presented as visual studies, not as screenshots of the applications. Replace or supplement them with real project captures when they are available.

Selecting a project updates the preview. Clicking or pressing Enter opens an accessible project detail dialog with a URL hash such as `#project/dns`, so browser back/forward navigation works. On mobile, the same list works through tap selection.

## Before publishing

1. Add a verified public email address to the contact section.
2. Replace the abstract portrait placeholder with a personal photograph if desired.
3. Add live demo links only after verifying each deployment.
4. Update the social-sharing image and canonical URL when a domain is available.

## Accessibility and motion

The page includes a skip link, semantic landmarks, visible keyboard focus, touch-friendly controls, reduced-motion support, and a mobile navigation menu. Essential project information is visible without hover.
