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
- `styles.css` — design tokens, responsive layouts, typographic project index, detail dialog, visual studies, and motion styles.
- `script.js` — navigation, project preview selection, URL/hash history, accessible project detail views, scroll progress, reveal choreography, and reduced-motion handling.
- `favicon.svg` — minimal ES monogram favicon.
- `.env.example` — placeholder for the public form-delivery endpoint.

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

## Inquiry form setup

The form validates fields in the browser and includes a hidden honeypot field. It does **not** pretend to send a message when no delivery service is configured. Without `VITE_FORM_ENDPOINT`, it shows an actionable setup message and keeps GitHub as the verified fallback contact route.

To enable real delivery:

1. Create a form endpoint with a provider that accepts browser `POST` requests, such as Formspree or another compatible service.
2. Copy `.env.example` to `.env`.
3. Set `VITE_FORM_ENDPOINT` to the provider's public form endpoint. Do not put private API keys in this file or in client-side code.
4. Restart `npm run dev` after changing `.env`.
5. Add the same `VITE_FORM_ENDPOINT` environment variable in the deployment provider's project settings.
6. Submit a test inquiry and confirm delivery in the provider dashboard and destination inbox before publishing the form link.

The current repository has no backend or existing email integration, and no provider endpoint was available to verify in this environment. Therefore, end-to-end delivery is intentionally left unclaimed until the endpoint is configured.

## Accessibility and motion

The page includes a skip link, semantic landmarks, visible keyboard focus, touch-friendly controls, reduced-motion support, and a mobile navigation menu. Essential project information is visible without hover.
