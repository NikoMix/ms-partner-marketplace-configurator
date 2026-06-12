import {
  BILLING,
  BASE_LISTING_FIELDS,
  SUPPORT_FIELDS,
  STANDARD_ASSETS,
  LOGO_ASSETS,
  SCREENSHOTS_ASSET,
  HERO_ASSET
} from './common';
import type { DecisionCategory, DecisionQuestion, OfferType } from './types';

const DOC = 'https://learn.microsoft.com/en-us/partner-center/marketplace-offers/';

// ---------------------------------------------------------------------------
// Categories (top level of the decision tree)
// ---------------------------------------------------------------------------

export const CATEGORIES: DecisionCategory[] = [
  {
    id: 'saas',
    name: 'Software as a Service (SaaS)',
    description: 'Your application is hosted in your own (publisher) tenant and sold as a service.',
    icon: 'cloud'
  },
  {
    id: 'azure',
    name: 'Azure (deployed to customer tenant)',
    description: 'VMs, containers or Azure resources that deploy into the customer’s Azure subscription.',
    icon: 'server'
  },
  {
    id: 'm365',
    name: 'Microsoft 365 & Copilot',
    description: 'Teams apps, Office add-ins, SharePoint solutions and Copilot Studio agents/connectors.',
    icon: 'apps'
  },
  {
    id: 'dynamics',
    name: 'Dynamics 365 & Power Platform',
    description: 'Dataverse/Power Apps, Operations apps, Business Central and Power BI visuals.',
    icon: 'grid'
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Consulting (professional services) or ongoing managed services via Azure Lighthouse.',
    icon: 'people'
  },
  {
    id: 'ai',
    name: 'AI apps & agents / Not sure',
    description: 'AI-powered applications and agents, or let the assistant help you decide.',
    icon: 'sparkle'
  }
];

// ---------------------------------------------------------------------------
// Offer-type catalog
// ---------------------------------------------------------------------------

export const OFFER_TYPES: OfferType[] = [
  {
    id: 'saas',
    name: 'Software as a Service (SaaS)',
    categoryId: 'saas',
    tagline: 'Sell a cloud application hosted in your own tenant.',
    description:
      'A transactable or listing-only SaaS offer. When sold through Microsoft, the commercial transaction and billing are handled by Microsoft while you host and operate the software in your tenant.',
    transactable: 'yes',
    transactabilityNote:
      'Choosing "Sell through Microsoft" enables Microsoft-managed billing. This decision is permanent for the offer.',
    listingOptions: ['contact-me', 'free-trial', 'get-it-now', 'transactable'],
    billingModels: [BILLING.perUser, BILLING.flatRate, BILLING.usageMetered, BILLING.annualContract],
    requiredAssets: STANDARD_ASSETS,
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}plan-saas-offer`,
    billingZipKind: 'saas-metered'
  },
  {
    id: 'azure-vm',
    name: 'Azure Virtual Machine',
    categoryId: 'azure',
    tagline: 'Publish a VM image that deploys to the customer’s subscription.',
    description:
      'A single virtual machine image offer. Best when your solution only requires compute. Software fees are added on top of the customer’s Azure compute costs.',
    transactable: 'yes',
    listingOptions: ['free-trial', 'get-it-now'],
    billingModels: [BILLING.vmCoreHour, BILLING.vmFlatMonthly, BILLING.vmReservation],
    requiredAssets: STANDARD_ASSETS,
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}marketplace-virtual-machines`,
    billingZipKind: 'azure-vm'
  },
  {
    id: 'azure-container',
    name: 'Azure Container',
    categoryId: 'azure',
    tagline: 'Publish containerized / Kubernetes workloads.',
    description:
      'A container or Kubernetes application offer delivered through the Azure Container Registry. Supports metered billing across container dimensions.',
    transactable: 'yes',
    listingOptions: ['get-it-now'],
    billingModels: [BILLING.containerUsage, BILLING.usageMetered],
    requiredAssets: STANDARD_ASSETS,
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}marketplace-containers`,
    billingZipKind: 'azure-container'
  },
  {
    id: 'azure-application',
    name: 'Azure Application',
    categoryId: 'azure',
    tagline: 'Deploy multiple Azure (PaaS) resources via managed app or solution template.',
    description:
      'An Azure application offer (managed application or solution template) that provisions one or more Azure resources into the customer’s subscription. Supports flat-rate and metered software fees.',
    transactable: 'yes',
    listingOptions: ['get-it-now'],
    billingModels: [BILLING.flatRate, BILLING.usageMetered],
    requiredAssets: STANDARD_ASSETS,
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}plan-azure-application-offer`,
    billingZipKind: 'azure-app'
  },
  {
    id: 'teams-app',
    name: 'Microsoft Teams app',
    categoryId: 'm365',
    tagline: 'Extend Microsoft Teams / Copilot; transact via a linked SaaS offer.',
    description:
      'A Teams application published to AppSource. To sell it, link it to a transactable SaaS offer that handles billing.',
    transactable: 'via-saas',
    transactabilityNote: 'Link this app to a transactable SaaS offer to enable purchasing.',
    listingOptions: ['contact-me', 'free-trial', 'get-it-now'],
    billingModels: [BILLING.linkedSaaS],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET, HERO_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}submit-to-appsource-via-partner-center`,
    billingZipKind: 'saas-subscription'
  },
  {
    id: 'office-add-in',
    name: 'Office Add-in',
    categoryId: 'm365',
    tagline: 'Extend Word/Excel/Outlook; transact via a linked SaaS offer.',
    description:
      'An Office add-in published to AppSource. Link it to a transactable SaaS offer to enable purchasing and billing.',
    transactable: 'via-saas',
    transactabilityNote: 'Link this add-in to a transactable SaaS offer to enable purchasing.',
    listingOptions: ['contact-me', 'free-trial', 'get-it-now'],
    billingModels: [BILLING.linkedSaaS],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}submit-to-appsource-via-partner-center`,
    billingZipKind: 'saas-subscription'
  },
  {
    id: 'sharepoint-solution',
    name: 'SharePoint solution',
    categoryId: 'm365',
    tagline: 'SharePoint Framework solution; transact via a linked SaaS offer.',
    description:
      'A SharePoint Framework (SPFx) solution published to AppSource, optionally linked to a transactable SaaS offer.',
    transactable: 'via-saas',
    listingOptions: ['contact-me', 'free-trial', 'get-it-now'],
    billingModels: [BILLING.linkedSaaS],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}submit-to-appsource-via-partner-center`,
    billingZipKind: 'saas-subscription'
  },
  {
    id: 'copilot-studio-agent',
    name: 'Connectors & Agents for Copilot Studio',
    categoryId: 'm365',
    tagline: 'Power Platform connectors and Copilot Studio agents.',
    description:
      'Custom connectors and agents for Microsoft Copilot Studio / Power Platform. These listings are not transactable through the marketplace.',
    transactable: 'no',
    transactabilityNote: 'Not transactable in the marketplace today.',
    listingOptions: ['contact-me', 'get-it-now'],
    billingModels: [],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}power-platform-offer`,
    billingZipKind: 'none'
  },
  {
    id: 'dynamics-dataverse',
    name: 'Dynamics 365 apps on Dataverse & Power Apps',
    categoryId: 'dynamics',
    tagline: 'Customer Service, Sales, Marketing built on Dataverse.',
    description:
      'Apps built on Microsoft Dataverse and Power Apps. Transactable with per-user pricing and managed via ISV app license management.',
    transactable: 'yes',
    listingOptions: ['free-trial', 'contact-me', 'get-it-now'],
    billingModels: [BILLING.perUser],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET, HERO_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}marketplace-dynamics-365`,
    billingZipKind: 'marketplace-generic'
  },
  {
    id: 'dynamics-operations',
    name: 'Dynamics 365 Operations Apps',
    categoryId: 'dynamics',
    tagline: 'Finance, Supply Chain, Commerce, HR, Project Operations.',
    description:
      'Apps for Dynamics 365 finance and operations. Listed in the marketplace but not transactable through it.',
    transactable: 'no',
    transactabilityNote: 'Not transactable in the marketplace.',
    listingOptions: ['free-trial', 'contact-me', 'get-it-now'],
    billingModels: [],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET, HERO_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}marketplace-dynamics-365`,
    billingZipKind: 'none'
  },
  {
    id: 'business-central-connect',
    name: 'Business Central (Connect app)',
    categoryId: 'dynamics',
    tagline: 'Connect an existing SaaS solution to Business Central.',
    description:
      'A Business Central connect app that integrates an external SaaS solution. Billing is handled by the linked SaaS offer.',
    transactable: 'via-saas',
    listingOptions: ['contact-me', 'get-it-now'],
    billingModels: [BILLING.linkedSaaS],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}marketplace-dynamics-365`,
    billingZipKind: 'saas-subscription'
  },
  {
    id: 'business-central-extend',
    name: 'Business Central (Extend app)',
    categoryId: 'dynamics',
    tagline: 'Add custom APIs / Copilot capabilities to Business Central.',
    description:
      'A Business Central extension (AL) app that adds functionality. Transactable with per-user and flat-rate pricing.',
    transactable: 'yes',
    listingOptions: ['free-trial', 'contact-me', 'get-it-now'],
    billingModels: [BILLING.perUser, BILLING.flatRate],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}marketplace-dynamics-365`,
    billingZipKind: 'marketplace-generic'
  },
  {
    id: 'power-bi-visual',
    name: 'Power BI Visual',
    categoryId: 'dynamics',
    tagline: 'A custom visual for Power BI.',
    description:
      'A custom Power BI visual published to AppSource. Transactable with per-user pricing.',
    transactable: 'yes',
    listingOptions: ['free-trial', 'contact-me', 'get-it-now'],
    billingModels: [BILLING.perUser],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}power-bi-visual-offer-setup`,
    billingZipKind: 'marketplace-generic'
  },
  {
    id: 'professional-service',
    name: 'Professional service',
    categoryId: 'services',
    tagline: 'Fixed-scope consulting, implementation or workshop engagements.',
    description:
      'A consulting/professional services offer (assessment, workshop, proof of concept, implementation). Customers contact you; private offers are supported.',
    transactable: 'no',
    transactabilityNote: 'Lead-based (Contact me). Supports private offers.',
    listingOptions: ['contact-me'],
    billingModels: [],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}plan-professional-service-offer`,
    billingZipKind: 'none'
  },
  {
    id: 'managed-service',
    name: 'Managed Service',
    categoryId: 'services',
    tagline: 'Ongoing managed services via Azure Lighthouse.',
    description:
      'A managed service offer delivered through Azure Lighthouse, granting you delegated access to manage customer resources.',
    transactable: 'no',
    transactabilityNote: 'Get it now (Azure Lighthouse onboarding); not a billed transaction.',
    listingOptions: ['get-it-now'],
    billingModels: [],
    requiredAssets: [...LOGO_ASSETS, SCREENSHOTS_ASSET],
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}plan-managed-service-offer`,
    billingZipKind: 'none'
  },
  {
    id: 'ai-app-agent',
    name: 'AI apps & agents',
    categoryId: 'ai',
    tagline: 'AI-powered applications and agents.',
    description:
      'AI applications and agents published to the commercial marketplace. These are commonly delivered as transactable SaaS offers to enable Microsoft-managed billing.',
    transactable: 'via-saas',
    transactabilityNote:
      'AI apps & agents are typically published as (or linked to) a transactable SaaS offer for billing.',
    listingOptions: ['contact-me', 'free-trial', 'get-it-now', 'transactable'],
    billingModels: [BILLING.perUser, BILLING.flatRate, BILLING.usageMetered],
    requiredAssets: STANDARD_ASSETS,
    requiredFields: [...BASE_LISTING_FIELDS, ...SUPPORT_FIELDS],
    docUrl: `${DOC}artificial-intelligence-apps-agents-publish`,
    billingZipKind: 'saas-metered'
  }
];

// ---------------------------------------------------------------------------
// Decision-tree questions (per category). Selecting a category may resolve
// directly to an offer type or branch into a question.
// ---------------------------------------------------------------------------

export const QUESTIONS: DecisionQuestion[] = [
  {
    id: 'q-azure',
    categoryId: 'azure',
    prompt: 'What does your solution deploy into the customer’s Azure subscription?',
    helper: 'This determines whether a VM, container or full Azure application offer fits best.',
    options: [
      {
        id: 'azure-compute-only',
        label: 'Only compute, via a single VM image',
        description: 'One virtual machine image with your software pre-installed.',
        offerTypeId: 'azure-vm'
      },
      {
        id: 'azure-containers',
        label: 'Containerized / Kubernetes workloads',
        description: 'Docker containers or a Kubernetes (AKS) application.',
        offerTypeId: 'azure-container'
      },
      {
        id: 'azure-paas',
        label: 'Multiple Azure (PaaS) resources',
        description: 'A managed application or solution template provisioning several resources.',
        offerTypeId: 'azure-application'
      }
    ]
  },
  {
    id: 'q-m365',
    categoryId: 'm365',
    prompt: 'Which Microsoft 365 surface does your solution extend?',
    options: [
      {
        id: 'm365-teams',
        label: 'Microsoft Teams or Microsoft 365 Copilot',
        offerTypeId: 'teams-app'
      },
      {
        id: 'm365-power',
        label: 'Power Platform / Copilot Studio (connector or agent)',
        offerTypeId: 'copilot-studio-agent'
      },
      {
        id: 'm365-sharepoint',
        label: 'SharePoint',
        offerTypeId: 'sharepoint-solution'
      },
      {
        id: 'm365-office',
        label: 'Office add-in (Word, Excel, Outlook, PowerPoint)',
        offerTypeId: 'office-add-in'
      }
    ]
  },
  {
    id: 'q-dynamics',
    categoryId: 'dynamics',
    prompt: 'Which Dynamics 365 / Power Platform area does your solution target?',
    options: [
      {
        id: 'dyn-dataverse',
        label: 'Customer Service, Sales or Marketing (Dataverse / Power Apps)',
        offerTypeId: 'dynamics-dataverse'
      },
      {
        id: 'dyn-operations',
        label: 'Commerce, Finance, HR, Project Operations or Supply Chain',
        offerTypeId: 'dynamics-operations'
      },
      {
        id: 'dyn-bc-connect',
        label: 'Business Central — connect an existing SaaS solution',
        offerTypeId: 'business-central-connect'
      },
      {
        id: 'dyn-bc-extend',
        label: 'Business Central — add custom APIs / Copilot (extend)',
        offerTypeId: 'business-central-extend'
      },
      {
        id: 'dyn-powerbi',
        label: 'Power BI visual',
        offerTypeId: 'power-bi-visual'
      }
    ]
  },
  {
    id: 'q-services',
    categoryId: 'services',
    prompt: 'What kind of service engagement do you offer?',
    options: [
      {
        id: 'svc-professional',
        label: 'Fixed-scope consulting / implementation engagement',
        description: 'Assessments, workshops, proofs of concept, implementations.',
        offerTypeId: 'professional-service'
      },
      {
        id: 'svc-managed',
        label: 'Ongoing managed service (Azure Lighthouse)',
        offerTypeId: 'managed-service'
      }
    ]
  }
];

// Categories that resolve directly to a single offer type (no question).
export const CATEGORY_DIRECT_OFFER: Record<string, string | undefined> = {
  saas: 'saas',
  ai: 'ai-app-agent'
};

export function getOfferType(id: string | undefined): OfferType | undefined {
  return OFFER_TYPES.find((o) => o.id === id);
}

export function getQuestionForCategory(categoryId: string): DecisionQuestion | undefined {
  return QUESTIONS.find((q) => q.categoryId === categoryId);
}

export function getCategory(id: string | undefined): DecisionCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
