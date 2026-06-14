// ---------------------------------------------------------------------------
// Maps the wizard's offer state to a Partner Center Product Ingestion API
// `configure` payload.
//
// Design: the configure job is atomic — a single invalid property fails the
// whole job (so the product would not be created). We therefore emit only
// resources whose schemas are verified and guaranteed-valid:
//   • product                      (identity + type + alias)
//   • commercial-marketplace-setup (SaaS only; enables sell-through-Microsoft)
//   • plan(s)                       (identity + alias skeletons)
//
// Listing copy and pricing are emitted as a documented sidecar
// (`listing-content.json` + MAPPING.md) that the partner reviews and applies
// after a `GET resource-tree` reveals the exact listing schema for their
// product — rather than risking the whole job on a guessed listing payload.
// ---------------------------------------------------------------------------

import type { ProductIngestionType } from './coverage';

// Verified schema versions (see README "Submit via Partner Center").
export const SCHEMA_VERSIONS = {
  configure: '2022-03-01-preview2',
  product: '2022-03-01-preview3',
  plan: '2022-03-01-preview2',
  commercialMarketplaceSetup: '2022-03-01-preview2',
  submission: '2022-03-01-preview2'
} as const;

const SCHEMA_BASE = 'https://schema.mp.microsoft.com/schema';

export interface SubmissionPlanInput {
  name: string;
  billingModelLabel: string;
  price: string;
  cadence: string;
  notes: string;
}

export interface SubmissionInput {
  offerId: string;
  /** Public-facing offer name → product alias. */
  offerName: string;
  productIngestionType: ProductIngestionType;
  /** When true, emit commercial-marketplace-setup with sellThroughMicrosoft. */
  transactable: boolean;
  /** Listing field id → value (from wizard fieldValues). */
  listing: Record<string, string>;
  plans: SubmissionPlanInput[];
}

interface ResourceRef {
  resourceName: string;
}

interface ProductResource {
  $schema: string;
  resourceName: string;
  identity: { externalID: string };
  type: ProductIngestionType;
  alias: string;
}

interface CommercialMarketplaceSetupResource {
  $schema: string;
  product: ResourceRef;
  sellThroughMicrosoft: boolean;
  useMicrosoftLicenseManagementService: boolean;
}

interface PlanResource {
  $schema: string;
  resourceName: string;
  product: ResourceRef;
  identity: { externalID: string };
  alias: string;
}

type ConfigureResource = ProductResource | CommercialMarketplaceSetupResource | PlanResource;

export interface ConfigurePayload {
  $schema: string;
  resources: ConfigureResource[];
}

export interface ListingContent {
  offerName: string;
  searchResultSummary: string;
  shortDescription: string;
  description: string;
  searchKeywords: string[];
  getStartedInstructions: string;
  privacyPolicyUrl: string;
  supportUrl: string;
  termsOfUseUrl: string;
  plans: Array<{
    externalId: string;
    name: string;
    billingModel: string;
    price: string;
    cadence: string;
    notes: string;
  }>;
}

const PRODUCT_RESOURCE_NAME = 'offer';

/** Normalize a name into a Product Ingestion externalID (3–50 chars, lowercase). */
export function toExternalId(value: string, fallback: string): string {
  let slug = (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length < 3) {
    slug = (fallback || 'offer')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (slug.length < 3) slug = `offer-${slug}`.replace(/^-+|-+$/g, '');
  // ensure leading alphanumeric
  if (!/^[a-z0-9]/.test(slug)) slug = `o${slug}`;
  return slug.slice(0, 50);
}

function planResourceName(externalId: string, index: number): string {
  const base = `plan-${externalId}`.replace(/[^a-zA-Z0-9-_]/g, '-');
  return base.slice(0, 46) || `plan-${index + 1}`;
}

function schema(kind: keyof typeof SCHEMA_VERSIONS): string {
  return `${SCHEMA_BASE}/${kindPath(kind)}/${SCHEMA_VERSIONS[kind]}`;
}

function kindPath(kind: keyof typeof SCHEMA_VERSIONS): string {
  switch (kind) {
    case 'commercialMarketplaceSetup':
      return 'commercial-marketplace-setup';
    default:
      return kind;
  }
}

/**
 * Build the guaranteed-valid configure payload: product (+ commercial setup for
 * SaaS) + plan skeletons. Plans dedupe their externalIDs.
 */
export function buildConfigurePayload(input: SubmissionInput): ConfigurePayload {
  const productExternalId = toExternalId(input.offerName, input.offerId);
  const resources: ConfigureResource[] = [];

  resources.push({
    $schema: schema('product'),
    resourceName: PRODUCT_RESOURCE_NAME,
    identity: { externalID: productExternalId },
    type: input.productIngestionType,
    alias: (input.offerName || input.offerId).slice(0, 200)
  });

  if (input.productIngestionType === 'softwareAsAService') {
    resources.push({
      $schema: schema('commercialMarketplaceSetup'),
      product: { resourceName: PRODUCT_RESOURCE_NAME },
      sellThroughMicrosoft: input.transactable,
      useMicrosoftLicenseManagementService: false
    });
  }

  const usedIds = new Set<string>();
  input.plans.forEach((plan, index) => {
    let externalId = toExternalId(plan.name, `plan-${index + 1}`);
    while (usedIds.has(externalId)) {
      externalId = toExternalId(`${externalId}-${index + 1}`, `plan-${index + 1}`);
    }
    usedIds.add(externalId);
    resources.push({
      $schema: schema('plan'),
      resourceName: planResourceName(externalId, index),
      product: { resourceName: PRODUCT_RESOURCE_NAME },
      identity: { externalID: externalId },
      alias: (plan.name || `Plan ${index + 1}`).slice(0, 125)
    });
  });

  return {
    $schema: `${SCHEMA_BASE}/configure/${SCHEMA_VERSIONS.configure}`,
    resources
  };
}

/** Build the neutral listing/pricing sidecar the partner applies post-create. */
export function buildListingContent(input: SubmissionInput): ListingContent {
  const l = input.listing;
  return {
    offerName: input.offerName,
    searchResultSummary: (l.searchResultSummary ?? '').trim(),
    shortDescription: (l.shortDescription ?? '').trim(),
    description: (l.description ?? '').trim(),
    searchKeywords: (l.searchKeywords ?? '')
      .split(/[\n,]/)
      .map((k) => k.trim())
      .filter(Boolean),
    getStartedInstructions: (l.getStarted ?? '').trim(),
    privacyPolicyUrl: (l.privacyPolicyUrl ?? '').trim(),
    supportUrl: (l.supportUrl ?? '').trim(),
    termsOfUseUrl: (l.termsUrl ?? '').trim(),
    plans: input.plans.map((plan, index) => ({
      externalId: toExternalId(plan.name, `plan-${index + 1}`),
      name: plan.name,
      billingModel: plan.billingModelLabel,
      price: plan.price,
      cadence: plan.cadence,
      notes: plan.notes
    }))
  };
}

/** Durable product reference used by the submission step at publish time. */
export function productDurableRef(productId: string): string {
  return productId.startsWith('product/') ? productId : `product/${productId}`;
}
