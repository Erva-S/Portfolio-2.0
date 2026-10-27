# Erva Savaliya — Signature Portfolio

A static, editorial portfolio for Erva Savaliya, built with Vite, semantic HTML, CSS, and vanilla JavaScript.

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

### Windows / OneDrive dependency repair

`node_modules` is platform-specific. Do not reuse a Linux/WSL `node_modules` folder from Windows or the reverse. If Windows reports a missing `@rollup/rollup-win32-*` or another optional native dependency, close any running dev server and run this from **Command Prompt or PowerShell**:

```bat
cd /d "E:\OneDrive\Desktop\Portfolio 2.0"
npm ci
npm run dev
```

`npm ci` uses the checked-in lockfile and installs the dependencies for the current Windows platform. If OneDrive has locked the old dependency folder, close VS Code terminals and any running Node processes, then run:

```bat
rmdir /s /q node_modules
npm ci
npm run dev
```

The project is pinned to Vite `4.5.14` to avoid the Rollup native-binding issue affecting the current shared Windows/WSL install.

## Structure

- `index.html` — page structure, content, metadata, and verified project links.
- `styles.css` — design tokens, responsive layouts, typographic project index, authentic preview states, detail dialog, and motion styles.
- `script.js` — navigation, featured project selection, authentic preview rendering, URL/hash history, accessible project detail views, scroll progress, reveal choreography, and reduced-motion handling.
- `favicon.svg` — minimal ES monogram favicon.
- `.env.example` — placeholder for the public form-delivery endpoint.

## Content notes

The Workbench currently features these projects, in order, from the `projects` registry inside `script.js`:

- Shreedutta Clinic
- Revora AI Meeting Assistant
- Adhira — SIH Project
- Adhira — Travel Companion
- Aethera — Travel Platform

Authentic preview assets are stored in `assets/previews/`. Shreedutta Clinic uses a capture from its verified deployment; the supplied Aethera, Revora, Adhira SIH, and Adhira travel screenshots are used for the corresponding project previews. Only the verified Shreedutta deployment and public Aethera repository are exposed as project destinations.

Selecting a project updates the preview. Clicking or pressing Enter opens an accessible project detail dialog with a URL hash such as `#project/revora`, so browser back/forward navigation works. On mobile, the same list works through tap selection.

## Before publishing

1. Add a verified public email address to the contact section.
2. Replace the abstract portrait placeholder with a personal photograph if desired.
3. Add live demo links only after verifying each deployment.
4. Update the social-sharing image and canonical URL when a domain is available.

## Inquiry form setup

The inquiry form validates fields in the browser and uses [Forminit](https://forminit.com) for backend submission handling (configured directly with `FORMINIT_FORM_ID` in `script.js`).

- Form submissions are sent directly via Forminit's client SDK.
- Honeypot anti-spam protection is included.
- No `.env` file or environment variables are required for standard delivery.

## Accessibility and motion

The page includes a skip link, semantic landmarks, visible keyboard focus, touch-friendly controls, reduced-motion support, and a mobile navigation menu. Essential project information is visible without hover.
