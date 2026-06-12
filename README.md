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

### Configuring the GitHub OAuth App

> **Which return URL do I enter?** This app signs in with the GitHub **OAuth _device flow_**, which
> **never redirects back to the app** — so there is no functional "return URL". GitHub's registration
> form nevertheless makes **Authorization callback URL** a **required** field, so you must enter
> *something* valid. Use your GitHub Pages URL:
>
> ```
> https://nikomix.github.io/ms-partner-marketplace-configurator/
> ```
>
> Its value is never used during sign-in; the field just can't be left blank. The setting that
> **actually** matters is the **Enable Device Flow** checkbox — sign-in fails if it isn't ticked.

The device flow is what lets a purely static, browser-only app authenticate **without a client
secret** (a secret could never be kept safe in client-side code). Rather than redirecting, the app
shows the user a short code to enter at `https://github.com/login/device`, then polls GitHub until
they approve.

**1. Register the OAuth App**

Go to **GitHub → Settings → Developer settings → [OAuth Apps](https://github.com/settings/developers)
→ New OAuth App** (or your organization's **Settings → Developer settings → OAuth Apps** to share it
across a team), and fill in:

| Field | Value | Notes |
| --- | --- | --- |
| **Application name** | e.g. `Marketplace Offer Wizard` | Shown on the GitHub authorization screen. |
| **Homepage URL** | `https://nikomix.github.io/ms-partner-marketplace-configurator/` | Your deployed site (use your fork's Pages URL if different). |
| **Authorization callback URL** | `https://nikomix.github.io/ms-partner-marketplace-configurator/` | **Required by the form but unused by the device flow.** Any valid URL works; the Pages URL is the tidy choice. |
| **Enable Device Flow** | ✅ **Checked** | **Required** — sign-in does not work without it. |

You do **not** need a client secret — leave it ungenerated/unused.

For **local development**, you can reuse the same app (the callback URL still doesn't matter), or set
the fields to `http://localhost:5173/ms-partner-marketplace-configurator/`.

**2. Provide the Client ID**

Copy the **Client ID** from the OAuth App page (it looks like `Iv1.0123456789abcdef`) and give it to
the wizard either way:

- **Build time (recommended for the deployed site)** — add a repository **variable** named
  `VITE_GITHUB_OAUTH_CLIENT_ID` under **Settings → Secrets and variables → Actions → Variables**. The
  Pages workflow ([`deploy.yml`](.github/workflows/deploy.yml)) passes it into the build. (A client id
  is public, so a *variable* — not a secret — is correct.)
- **Runtime** — paste it into **Settings → Sign-in configuration (advanced) → OAuth App client id**
  inside the running app.

**3. Add a CORS proxy**

GitHub's device and token endpoints (`github.com/login/…`) don't return CORS headers, so the browser
can't call them directly. Provide a CORS proxy **prefix** — the GitHub URL is appended to it — via the
`VITE_CORS_PROXY` repository variable (build time) or **Settings → Sign-in configuration → CORS proxy
prefix** (runtime). If you'd rather not run a proxy, use the **Bring your own token** option instead,
which needs no proxy.

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

## Deep linking / JSON import

Other applications and agents can open the wizard **pre-populated** with an offering, so a partner
lands directly on whatever still needs their attention instead of starting from a blank wizard.
There is no backend — the offering travels in the URL and is hydrated entirely in the browser.

### URL format

```
<wizard-url>?offer=<payload>
```

`<payload>` is either:

- **base64url-encoded JSON** (recommended — compact and avoids URL-escaping issues), or
- **URL-encoded raw JSON** (the value starts with `{`).

A hash form is also accepted for environments that strip query strings:

```
<wizard-url>#offer=<payload>
```

On load the wizard validates the payload, fills in everything it recognises, and **jumps to the
first step that still requires input**:

| First missing thing | Lands on |
| --- | --- |
| Valid offer type | Offer type |
| Listing acquisition option | Requirements |
| A required listing field | Listing details |
| A required asset | Assets |
| Billing plans (for transactable offers) | Billing & plans |
| Nothing — everything present | Review & export |

After import, the `offer` parameter is stripped from the address bar so refreshing or sharing the
page won't re-trigger the import.

### Payload schema

The accepted fields and permitted values are described by a JSON Schema (draft 2020-12), published
alongside the app:

```
https://nikomix.github.io/ms-partner-marketplace-configurator/offer.schema.json
```

Only `offerTypeId` is required. Unknown fields are rejected; values that don't belong to the chosen
offer type (listing options, billing models, listing fields, assets) are ignored so a partner is
never shown something invalid. `categoryId` and the decision-tree answers are derived from
`offerTypeId`, so callers only need to set `offerTypeId`.

Minimal example:

```json
{
  "version": "1",
  "offerTypeId": "saas",
  "listingOptionId": "transactable",
  "billingLanguage": "csharp",
  "billingModelIds": ["flat-rate"],
  "listing": {
    "offerName": "Contoso Analytics",
    "searchResultSummary": "Real-time analytics for operations teams."
  },
  "plans": [
    { "name": "Standard", "billingModelId": "flat-rate", "price": "99", "cadence": "Monthly" }
  ]
}
```

### Building a link from another app or agent

Encode the JSON as base64url and append it as the `offer` query parameter:

```js
const offer = {
  version: '1',
  offerTypeId: 'saas',
  listing: { offerName: 'Contoso Analytics' }
};

// UTF-8 safe base64url
const bytes = new TextEncoder().encode(JSON.stringify(offer));
let binary = '';
bytes.forEach((b) => (binary += String.fromCharCode(b)));
const payload = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const url =
  'https://nikomix.github.io/ms-partner-marketplace-configurator/?offer=' + payload;
```

Raw JSON works too if you'd rather not encode — just URL-encode it:

```
https://nikomix.github.io/ms-partner-marketplace-configurator/?offer=%7B%22offerTypeId%22%3A%22saas%22%7D
```

> **Agents:** generate an object that validates against `offer.schema.json`, base64url-encode it,
> and hand the partner the resulting link. They'll resume exactly where information is still needed.

### Sharing from inside the wizard

The **Review & export** step has a **Copy shareable link** button that produces one of these links
for the current offering. Generated/uploaded image assets are **excluded** from the link to keep the
URL short — share those separately or via the project ZIP.

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

---

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit
[Contributor License Agreements](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the
instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the
[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more
information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or
comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of
Microsoft trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion
or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those
third-party's policies.
