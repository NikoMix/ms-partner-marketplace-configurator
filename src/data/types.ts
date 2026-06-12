// Domain model for the Microsoft Marketplace offer wizard.

export type ListingOptionId = 'contact-me' | 'free-trial' | 'get-it-now' | 'transactable';

export interface ListingOption {
  id: ListingOptionId;
  label: string;
  description: string;
}

export interface BillingModel {
  id: string;
  label: string;
  description: string;
  metered?: boolean;
  cadences?: string[];
}

export interface AssetSpec {
  id: string;
  label: string;
  required: boolean;
  width?: number;
  height?: number;
  format: string;
  maxCount?: number;
  notes?: string;
  /** Whether this asset can be produced by the AI image generator. */
  aiGenerable?: boolean;
}

export interface RequiredField {
  id: string;
  label: string;
  description: string;
  /** Can be drafted/refined by the GitHub Models text inference. */
  aiAssist?: boolean;
  maxLength?: number;
  multiline?: boolean;
  /** Render a rich-text editor (write/preview + HTML formatting) for this field. */
  richText?: boolean;
}

export type Transactability = 'yes' | 'no' | 'via-saas';

/** Implementation language for the generated billing/webhook starter. */
export type BillingLanguage = 'node' | 'csharp';

export type BillingZipKind =
  | 'saas-metered'
  | 'saas-subscription'
  | 'azure-app'
  | 'azure-vm'
  | 'azure-container'
  | 'marketplace-generic'
  | 'none';

export interface OfferType {
  id: string;
  name: string;
  categoryId: string;
  tagline: string;
  description: string;
  transactable: Transactability;
  transactabilityNote?: string;
  listingOptions: ListingOptionId[];
  billingModels: BillingModel[];
  requiredAssets: AssetSpec[];
  requiredFields: RequiredField[];
  docUrl: string;
  billingZipKind: BillingZipKind;
}

export interface DecisionCategory {
  id: string;
  name: string;
  description: string;
  /** Key into the icon map in the UI layer. */
  icon: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  nextQuestionId?: string;
  offerTypeId?: string;
}

export interface DecisionQuestion {
  id: string;
  categoryId: string;
  prompt: string;
  helper?: string;
  options: DecisionOption[];
}

export const LISTING_OPTIONS: Record<ListingOptionId, ListingOption> = {
  'contact-me': {
    id: 'contact-me',
    label: 'Contact me',
    description:
      'Collect customer contact details (lead) through Partner Center. No transaction occurs in the marketplace.'
  },
  'free-trial': {
    id: 'free-trial',
    label: 'Free trial',
    description: 'Offer a time-bound or feature-limited trial that customers can start from the listing.'
  },
  'get-it-now': {
    id: 'get-it-now',
    label: 'Get it now',
    description:
      'Customers acquire the offer directly. Includes Free, Bring-your-own-license (BYOL), subscription and usage-based variants.'
  },
  transactable: {
    id: 'transactable',
    label: 'Sell through Microsoft (transactable)',
    description:
      'Microsoft hosts the commerce transaction and handles billing/collections. You pay only Azure infrastructure costs. This cannot be changed after publishing.'
  }
};
