// Deep-link / JSON import support for the Marketplace Offer Wizard.
//
// External applications and agents can open the wizard pre-populated with an
// offering payload by passing it on the URL:
//
//   <wizard-url>?offer=<payload>
//
// where <payload> is either URL-encoded JSON matching public/offer.schema.json
// or a base64url-encoded form of the same JSON (preferred — it is compact and
// avoids escaping issues). The wizard validates the payload against the
// offer-type catalog, hydrates its state and jumps to the first wizard step
// that still needs input. There is no backend; everything happens in the
// browser from the query string (or the equivalent hash form `#offer=`).

import { getOfferType, getQuestionForCategory } from '../data/catalog';
import type { ListingOptionId } from '../data/types';
import type { PlanConfig, WizardState } from './WizardContext';

// ---------------------------------------------------------------------------
// Public payload shape (mirrors public/offer.schema.json)
// ---------------------------------------------------------------------------

export interface OfferImportPlan {
  name?: string;
  billingModelId?: string;
  price?: string;
  cadence?: string;
  notes?: string;
}

export interface OfferImport {
  version?: string;
  offerTypeId: string;
  categoryId?: string;
  answers?: Record<string, string>;
  listingOptionId?: string;
  billingLanguage?: string;
  billingModelIds?: string[];
  listing?: Record<string, string>;
  plans?: OfferImportPlan[];
  assets?: Record<string, string>;
}

// Wizard step indices (kept in sync with STEPS in WizardContext).
const STEP_DECIDE = 1;
const STEP_OVERVIEW = 2;
const STEP_LISTING = 3;
const STEP_ASSETS = 4;
const STEP_BILLING = 5;
const STEP_SUMMARY = 6;

// ---------------------------------------------------------------------------
// base64url helpers (UTF-8 safe, no deprecated escape/unescape)
// ---------------------------------------------------------------------------

export function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(input: string): string {
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function newPlanId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `plan-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Parsing the URL
// ---------------------------------------------------------------------------

function readOfferParam(search: string, hash: string): string | null {
  try {
    const fromSearch = new URLSearchParams(search).get('offer');
    if (fromSearch) return fromSearch;
  } catch {
    /* ignore malformed search */
  }
  if (hash) {
    try {
      const h = hash.startsWith('#') ? hash.slice(1) : hash;
      const query = h.includes('?') ? h.slice(h.indexOf('?') + 1) : h;
      const fromHash = new URLSearchParams(query).get('offer');
      if (fromHash) return fromHash;
    } catch {
      /* ignore malformed hash */
    }
  }
  return null;
}

function decodeOfferParam(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) return trimmed;
  try {
    const decoded = base64UrlDecode(trimmed);
    if (decoded.trim().startsWith('{')) return decoded;
  } catch {
    /* fall through */
  }
  return undefined;
}

/**
 * Extract and parse an OfferImport from the current location. Accepts either a
 * `?offer=` query parameter or a `#offer=` hash. The value may be raw
 * (URL-encoded) JSON or base64url-encoded JSON. Returns undefined when no valid
 * payload is present.
 */
export function parseOfferImportFromLocation(search: string, hash: string): OfferImport | undefined {
  const raw = readOfferParam(search, hash);
  if (!raw) return undefined;
  const json = decodeOfferParam(raw);
  if (!json) return undefined;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as { offerTypeId?: unknown }).offerTypeId === 'string'
    ) {
      return parsed as OfferImport;
    }
  } catch {
    /* invalid JSON */
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Determining the first incomplete step
// ---------------------------------------------------------------------------

/**
 * Returns the index of the first wizard step that still requires input for the
 * given (already validated) state. Used to jump an imported offering straight
 * to wherever the partner needs to continue.
 */
export function firstIncompleteStepIndex(state: WizardState): number {
  const offer = getOfferType(state.offerTypeId);
  if (!offer) return STEP_DECIDE;

  if (!state.listingOptionId) return STEP_OVERVIEW;

  const missingField = offer.requiredFields.some((f) => {
    const v = state.fieldValues[f.id];
    return !v || v.trim().length === 0;
  });
  if (missingField) return STEP_LISTING;

  const missingAsset = offer.requiredAssets
    .filter((a) => a.required)
    .some((a) => !state.assets[a.id]);
  if (missingAsset) return STEP_ASSETS;

  if (offer.billingModels.length > 0) {
    const billingDone = state.selectedBillingModelIds.length > 0 && state.plans.length > 0;
    if (!billingDone) return STEP_BILLING;
  }

  return STEP_SUMMARY;
}

// ---------------------------------------------------------------------------
// Applying an import to (a copy of) persisted state
// ---------------------------------------------------------------------------

/**
 * Validates the import against the offer-type catalog and produces a fresh
 * wizard state for it. Only `ai` and `prompts` are carried over from any
 * existing/persisted state; everything else describes the imported offering.
 * Returns undefined when the payload cannot be applied (unknown offer type).
 */
export function applyOfferImport(
  persisted: WizardState,
  imp: OfferImport
): { state: WizardState } | undefined {
  const offer = getOfferType(imp.offerTypeId);
  if (!offer) return undefined;

  const state: WizardState = {
    stepIndex: 0,
    categoryId: offer.categoryId,
    answers: {},
    offerTypeId: offer.id,
    listingOptionId: undefined,
    fieldValues: {},
    selectedBillingModelIds: [],
    plans: [],
    billingLanguage: 'node',
    assets: {},
    ai: persisted.ai,
    prompts: persisted.prompts
  };

  // Backfill the decision-tree answer so the Offer-type step shows the path
  // that leads to this offer (categories saas/ai resolve directly, no answer).
  const question = getQuestionForCategory(offer.categoryId);
  if (question) {
    const option = question.options.find((o) => o.offerTypeId === offer.id);
    if (option) state.answers[question.id] = option.id;
  }

  // Listing acquisition option.
  if (imp.listingOptionId && offer.listingOptions.includes(imp.listingOptionId as ListingOptionId)) {
    state.listingOptionId = imp.listingOptionId as ListingOptionId;
  } else if (offer.listingOptions.length === 1) {
    state.listingOptionId = offer.listingOptions[0];
  }

  // Listing copy — keep only fields that belong to this offer type.
  if (imp.listing && typeof imp.listing === 'object') {
    const validFieldIds = new Set(offer.requiredFields.map((f) => f.id));
    for (const [key, value] of Object.entries(imp.listing)) {
      if (validFieldIds.has(key) && typeof value === 'string') {
        state.fieldValues[key] = value;
      }
    }
  }

  // Billing models — filter to those supported by the offer.
  const offerModelIds = new Set(offer.billingModels.map((m) => m.id));
  const selected: string[] = [];
  if (Array.isArray(imp.billingModelIds)) {
    for (const id of imp.billingModelIds) {
      if (typeof id === 'string' && offerModelIds.has(id) && !selected.includes(id)) {
        selected.push(id);
      }
    }
  }

  // Plans — only when the offer supports billing. Each plan's model is
  // validated and auto-selected; a fresh id is always generated.
  if (offer.billingModels.length > 0 && Array.isArray(imp.plans)) {
    for (const p of imp.plans) {
      if (!p || typeof p !== 'object') continue;
      let modelId: string | undefined;
      if (typeof p.billingModelId === 'string' && offerModelIds.has(p.billingModelId)) {
        modelId = p.billingModelId;
      } else if (selected.length > 0) {
        modelId = selected[0];
      } else {
        modelId = offer.billingModels[0].id;
      }
      if (!selected.includes(modelId)) selected.push(modelId);
      const plan: PlanConfig = {
        id: newPlanId(),
        name: typeof p.name === 'string' ? p.name : '',
        billingModelId: modelId,
        price: typeof p.price === 'string' ? p.price : '',
        cadence: typeof p.cadence === 'string' ? p.cadence : '',
        notes: typeof p.notes === 'string' ? p.notes : ''
      };
      state.plans.push(plan);
    }
  }
  state.selectedBillingModelIds = selected;

  // Billing starter language.
  if (imp.billingLanguage === 'csharp' || imp.billingLanguage === 'node') {
    state.billingLanguage = imp.billingLanguage;
  }

  // Assets — accept only data: URLs for assets this offer actually uses.
  if (imp.assets && typeof imp.assets === 'object') {
    const validAssetIds = new Set(offer.requiredAssets.map((a) => a.id));
    for (const [key, value] of Object.entries(imp.assets)) {
      if (validAssetIds.has(key) && typeof value === 'string' && value.startsWith('data:')) {
        state.assets[key] = value;
      }
    }
  }

  state.stepIndex = firstIncompleteStepIndex(state);
  return { state };
}

// ---------------------------------------------------------------------------
// Building an import payload / shareable link from current state
// ---------------------------------------------------------------------------

/**
 * Builds a catalog-id-based OfferImport from the current wizard state. Unlike
 * the human-readable summary export, this round-trips cleanly back through
 * applyOfferImport. Assets are excluded unless explicitly requested (data URLs
 * make links very large).
 */
export function buildOfferImportFromState(
  state: WizardState,
  opts: { includeAssets?: boolean } = {}
): OfferImport | undefined {
  if (!state.offerTypeId || !getOfferType(state.offerTypeId)) return undefined;

  const imp: OfferImport = { version: '1', offerTypeId: state.offerTypeId };

  if (state.categoryId) imp.categoryId = state.categoryId;
  if (state.listingOptionId) imp.listingOptionId = state.listingOptionId;
  if (state.billingLanguage) imp.billingLanguage = state.billingLanguage;

  if (state.selectedBillingModelIds.length > 0) {
    imp.billingModelIds = [...state.selectedBillingModelIds];
  }

  const listing: Record<string, string> = {};
  for (const [key, value] of Object.entries(state.fieldValues)) {
    if (typeof value === 'string' && value.trim().length > 0) listing[key] = value;
  }
  if (Object.keys(listing).length > 0) imp.listing = listing;

  if (state.plans.length > 0) {
    imp.plans = state.plans.map((p) => ({
      name: p.name,
      billingModelId: p.billingModelId,
      price: p.price,
      cadence: p.cadence,
      notes: p.notes
    }));
  }

  if (opts.includeAssets && Object.keys(state.assets).length > 0) {
    imp.assets = { ...state.assets };
  }

  return imp;
}

export function encodeOfferImport(imp: OfferImport): string {
  return base64UrlEncode(JSON.stringify(imp));
}

/**
 * Produces a shareable deep link to the wizard for the current offering. Assets
 * are excluded to keep the URL short. Returns an empty string when there is no
 * offer type selected yet.
 */
export function buildShareLink(state: WizardState): string {
  const imp = buildOfferImportFromState(state, { includeAssets: false });
  if (!imp) return '';
  const encoded = encodeOfferImport(imp);
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?offer=${encoded}`;
}
