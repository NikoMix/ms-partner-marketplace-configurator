# Microsoft Marketplace Offer Wizard

A polished single-page application that helps **Microsoft Partners** plan and build their
**Microsoft commercial marketplace** offerings (via [Partner Center](https://partner.microsoft.com/)).
It guides you through choosing the right offer type, surfaces exactly what Partner Center will
require to publish, drafts and refines your listing copy with AI, generates correctly sized
marketplace image assets, and produces a downloadable **billing/costing starter template**.

The UI has a clean, professional look with Microsoft branding.

> Built as a static app and deployed to **GitHub Pages**.

---

## What it does

The wizard walks you through seven steps:

1. **Welcome** — overview of what you'll need.
2. **Decide** — pick your product family, answer a couple of guided questions, and get a
   recommended Partner Center offer type (SaaS, Azure Application, Azure Container, Azure VM,
   Dynamics 365, Power BI, Microsoft 365 & Copilot apps/agents, Managed/Professional services,
   AI apps & agents).
3. **Overview** — choose your listing call-to-action (Contact me / Free trial / Get it now /
   transactable), and review the required listing fields, visual assets, billing models and
   transactability for that offer type.
4. **Listing details** — fill in name and descriptions, with **AI draft & refine** helpers.
5. **Assets** — upload (auto-resized) or **AI-generate** each required image to the exact
   Partner Center dimensions, including **image-to-image** refinement.
6. **Billing & plans** — configure plans/pricing (incl. metered billing) and download a
   **billing starter ZIP** tailored to your offer type and billing model.
7. **Summary** — a publishing checklist plus exports: plan JSON and a full project ZIP
   (listing copy + assets + billing template).

Your progress is saved to `localStorage`, so you can close the tab and come back later.

---

## AI features

The AI helpers call the **[GitHub Models](https://github.com/marketplace/models)** inference API
directly from your browser — **your credentials are never sent anywhere except the model endpoint**
and are stored only in your browser's `localStorage`.

### Authenticate

You have two options, both configured in **Settings** (gear icon, top right):

- **Sign in with GitHub (recommended)** — authorize with your GitHub account via the device flow.
  You'll get a short code to enter on github.com, and the resulting access token is kept only in
  this browser. This requires a GitHub **OAuth App** (with device flow enabled); set its client id
  at build time via the `VITE_GITHUB_OAUTH_CLIENT_ID` env var or under **Settings → Sign-in
  configuration**. Because GitHub's sign-in endpoints don't permit direct browser calls, you also
  need a CORS proxy prefix (`VITE_CORS_PROXY`, or the same advanced settings).
- **Bring your own token** — create a token with **`models: read`** permission (a
  [fine-grained PAT](https://github.com/settings/personal-access-tokens) works well) and paste it
  into Settings. This is the simplest option and needs no proxy.

### Configure

In **Settings** you can also adjust:

- **Endpoint** — defaults to `https://models.github.ai/inference`.
- **Model** — defaults to a GPT-4o class chat model (e.g. `openai/gpt-4o`).
- **Image endpoint / image model** — GitHub Models serves text and embeddings only, so AI **image
  generation** uses a separate **OpenAI-compatible image API** (exposing `/images/generations` and
  `/images/edits`). Configure these to enable asset generation; leave the image endpoint blank to
  skip it.
- **System prompts** — edit the base, refine, and per-field prompts and reset them to defaults at
  any time, to keep listing copy accurate and on-brand.

> Nothing is proxied through a server for inference. All model requests go straight from your
> browser to the endpoint you configure. (The optional CORS proxy applies only to GitHub's sign-in
> endpoints.)

---

## Billing starter template

The **Billing & plans** step generates a ZIP scaffold appropriate to your offer type and billing
model — e.g. SaaS metered billing, SaaS subscription, Azure Application, Azure VM, Azure Container,
or a generic marketplace template. Use it as a starting point to wire up the Marketplace metering
and SaaS fulfillment APIs and to model your costs.

---

## Local development

Requires Node.js 20+.

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build locally
```

---

## Deploying to GitHub Pages

This repo ships a GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
that builds the app and publishes it to GitHub Pages on every push to `main`.

One-time setup:

1. In your repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site will be published to:

   ```
   https://<owner>.github.io/<repo>/
   ```

   For this repository that is
   `https://nikomix.github.io/ms-partner-marketplace-configurator/`.

The Vite `base` path defaults to `/ms-partner-marketplace-configurator/` and the workflow sets
`BASE_PATH=/<repo>/` automatically, so asset URLs resolve correctly under the project subpath.
If you fork or rename the repo, no code change is needed — the workflow derives the base path from
the repository name.

---

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Fluent UI v9** (`@fluentui/react-components`) with a custom Microsoft Learn–style theme
- **GitHub Models** API for text + image inference (client-side, BYO token)
- **JSZip** for starter-template generation

---

## Disclaimer

This tool is an unofficial planning aid. Always confirm current requirements against the official
[Microsoft commercial marketplace documentation](https://learn.microsoft.com/partner-center/marketplace-offers/)
before publishing. Offer-type requirements and policies can change.
