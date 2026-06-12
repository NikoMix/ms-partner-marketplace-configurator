import type { AssetSpec, BillingModel, RequiredField } from './types';

// ---------------------------------------------------------------------------
// Reusable billing models (derived from the offer-type decision tree)
// ---------------------------------------------------------------------------

export const BILLING: Record<string, BillingModel> = {
  perUser: {
    id: 'per-user',
    label: 'Per user (monthly / annual)',
    description: 'Charge a recurring price per seat. Common for SaaS and Dynamics 365 apps.',
    cadences: ['Monthly', 'Annual']
  },
  flatRate: {
    id: 'flat-rate',
    label: 'Flat rate (monthly / annual)',
    description: 'A single recurring site/tenant price independent of seat count.',
    cadences: ['Monthly', 'Annual']
  },
  usageMetered: {
    id: 'usage-metered',
    label: 'Usage-based (metered)',
    description:
      'Report consumption to the Marketplace Metering Service and bill customers for what they use.',
    metered: true
  },
  annualContract: {
    id: 'annual-contract',
    label: '1–3 year annual contracts',
    description: 'Offer 1-, 2- or 3-year committed terms billed annually or upfront.',
    cadences: ['1 year', '2 year', '3 year']
  },
  vmCoreHour: {
    id: 'vm-core-hour',
    label: 'Usage per core/hour',
    description: 'Per-core-hour software fee added on top of Azure VM compute (PAYG).',
    metered: true
  },
  vmFlatMonthly: {
    id: 'vm-flat-monthly',
    label: 'Flat rate (monthly)',
    description: 'Fixed monthly software fee per VM, independent of run time.',
    cadences: ['Monthly']
  },
  vmReservation: {
    id: 'vm-reservation',
    label: '1 / 3 year reservation (BYOL)',
    description: 'Reserved 1- or 3-year pricing, or bring-your-own-license.',
    cadences: ['1 year', '3 year']
  },
  containerUsage: {
    id: 'container-usage',
    label: 'Usage per core / pod / node / cluster',
    description: 'Metered billing dimensions for containerized / Kubernetes workloads.',
    metered: true
  },
  linkedSaaS: {
    id: 'linked-saas',
    label: 'Transact via linked SaaS offer',
    description:
      'Billing is handled by a separate transactable SaaS offer that this listing links to.'
  }
};

// ---------------------------------------------------------------------------
// Reusable asset specifications (Partner Center marketplace listing assets).
// Dimensions reflect commonly required sizes — always confirm in Partner Center.
// ---------------------------------------------------------------------------

export const LOGO_ASSETS: AssetSpec[] = [
  {
    id: 'logo-small',
    label: 'Small logo (48×48)',
    required: true,
    width: 48,
    height: 48,
    format: 'PNG',
    aiGenerable: true,
    notes: 'Shown in search results.'
  },
  {
    id: 'logo-medium',
    label: 'Medium logo (90×90)',
    required: false,
    width: 90,
    height: 90,
    format: 'PNG',
    aiGenerable: true
  },
  {
    id: 'logo-large',
    label: 'Large logo (216×216)',
    required: true,
    width: 216,
    height: 216,
    format: 'PNG',
    aiGenerable: true,
    notes: 'Primary listing logo; other sizes can be derived from it.'
  },
  {
    id: 'logo-wide',
    label: 'Wide logo (255×115)',
    required: false,
    width: 255,
    height: 115,
    format: 'PNG',
    aiGenerable: true
  }
];

export const HERO_ASSET: AssetSpec = {
  id: 'hero',
  label: 'Hero image (815×290)',
  required: false,
  width: 815,
  height: 290,
  format: 'PNG',
  aiGenerable: true,
  notes: 'Optional banner displayed at the top of the listing detail page.'
};

export const SCREENSHOTS_ASSET: AssetSpec = {
  id: 'screenshots',
  label: 'Screenshots (1280×720)',
  required: true,
  width: 1280,
  height: 720,
  format: 'PNG',
  maxCount: 5,
  aiGenerable: true,
  notes: 'Up to 5. Show the product UI / key scenarios.'
};

export const VIDEO_THUMB_ASSET: AssetSpec = {
  id: 'video-thumb',
  label: 'Video thumbnail (1280×720)',
  required: false,
  width: 1280,
  height: 720,
  format: 'PNG',
  aiGenerable: true,
  notes: 'Thumbnail for an optional YouTube/Vimeo demo video.'
};

export const STANDARD_ASSETS: AssetSpec[] = [
  ...LOGO_ASSETS,
  SCREENSHOTS_ASSET,
  HERO_ASSET,
  VIDEO_THUMB_ASSET
];

// ---------------------------------------------------------------------------
// Reusable listing fields. aiAssist marks copy that the AI can draft/refine.
// ---------------------------------------------------------------------------

export const BASE_LISTING_FIELDS: RequiredField[] = [
  {
    id: 'offerName',
    label: 'Offer name',
    description: 'The public name of your offer as it appears in the marketplace.',
    maxLength: 50
  },
  {
    id: 'searchResultSummary',
    label: 'Search results summary',
    description: 'A one-line summary (≈100 characters) shown in search results.',
    aiAssist: true,
    maxLength: 100
  },
  {
    id: 'shortDescription',
    label: 'Short description',
    description: 'A concise summary shown near the top of the listing (≈256 characters).',
    aiAssist: true,
    maxLength: 256,
    multiline: true
  },
  {
    id: 'description',
    label: 'Description',
    description:
      'The full listing description (supports basic HTML). Explain the value proposition, key features and target customers.',
    aiAssist: true,
    maxLength: 3000,
    multiline: true,
    richText: true
  },
  {
    id: 'searchKeywords',
    label: 'Search keywords',
    description: 'Up to 3 keywords that help customers find your offer.',
    aiAssist: true
  },
  {
    id: 'getStarted',
    label: 'Getting started instructions',
    description: 'Tell customers how to deploy / start using the offer after acquisition.',
    aiAssist: true,
    multiline: true
  }
];

export const SUPPORT_FIELDS: RequiredField[] = [
  {
    id: 'privacyPolicyUrl',
    label: 'Privacy policy URL',
    description: 'A public link to your privacy policy (required to publish).'
  },
  {
    id: 'supportUrl',
    label: 'Support URL / contact',
    description: 'Where customers get help with your offer.'
  },
  {
    id: 'termsUrl',
    label: 'Terms of use',
    description: 'Standard contract or a link to your custom terms.'
  }
];
