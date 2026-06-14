// ---------------------------------------------------------------------------
// Product Ingestion API coverage map.
//
// Determines, per offer type, whether the wizard can generate a runnable
// submission-script bundle that talks to the Partner Center Product Ingestion
// API (https://graph.microsoft.com/rp/product-ingestion), or whether the offer
// must be created manually in Partner Center.
//
// The API is app-only (client-credentials). A browser SPA cannot safely hold a
// client secret, and the endpoint blocks cross-origin browser calls, so the
// wizard never submits directly. Instead it emits a script the partner runs
// locally / in CI with their own Entra service principal.
//
// Only the product types with a verified `configure` schema (softwareAsAService,
// azureVirtualMachine, azureContainer) are marked "scriptable". Everything else
// is "manual" with a deep link to Partner Center.
// ---------------------------------------------------------------------------

export type SubmissionApi = 'product-ingestion';

/** Whether a script bundle can be generated, or the offer is manual-only. */
export type SubmissionAvailability = 'scriptable' | 'manual';

/** Product Ingestion `product.type` values with verified configure schemas. */
export type ProductIngestionType =
  | 'softwareAsAService'
  | 'azureVirtualMachine'
  | 'azureContainer';

export interface SubmissionCoverage {
  api: SubmissionApi;
  availability: SubmissionAvailability;
  /** Present only when availability === 'scriptable'. */
  productIngestionType?: ProductIngestionType;
  /** One-line summary shown in the UI. */
  note: string;
  /** Extra configuration the partner must add before the payload will submit. */
  prerequisites?: string[];
}

/** Partner Center marketplace-offers dashboard (create-offer entry point). */
export const PARTNER_CENTER_OFFERS_URL =
  'https://partner.microsoft.com/dashboard/marketplace-offers/overview';

const SAAS_PREREQUISITES = [
  'Complete the listing categories and lead-management destination in Partner Center (these are not set by the script).',
  'Add plan pricing & availability — the script creates plan skeletons; finalize prices in Partner Center or by extending the payload.',
  'Upload listing assets (logos, screenshots) in Partner Center; assets are not transferred by the configure payload.'
];

const VM_PREREQUISITES = [
  'Add the VM technical configuration (shared image gallery / SAS image URIs and operating system details) before submitting.',
  'Complete plan pricing & availability in Partner Center.',
  'Upload listing assets in Partner Center.'
];

const CONTAINER_PREREQUISITES = [
  'Add the container technical configuration (Azure Container Registry image references and tags) before submitting.',
  'Complete plan pricing & availability in Partner Center.',
  'Upload listing assets in Partner Center.'
];

function manual(note: string): SubmissionCoverage {
  return { api: 'product-ingestion', availability: 'manual', note };
}

/**
 * Coverage keyed by the wizard's offer-type id (see `src/data/catalog.ts`).
 */
export const SUBMISSION_COVERAGE: Record<string, SubmissionCoverage> = {
  saas: {
    api: 'product-ingestion',
    availability: 'scriptable',
    productIngestionType: 'softwareAsAService',
    note: 'Generates a configure payload + script that creates the SaaS product and plan skeletons via the Product Ingestion API.',
    prerequisites: SAAS_PREREQUISITES
  },
  'ai-app-agent': {
    api: 'product-ingestion',
    availability: 'scriptable',
    productIngestionType: 'softwareAsAService',
    note: 'AI apps & agents publish as a transactable SaaS product; the bundle creates that SaaS product and plan skeletons.',
    prerequisites: SAAS_PREREQUISITES
  },
  'azure-vm': {
    api: 'product-ingestion',
    availability: 'scriptable',
    productIngestionType: 'azureVirtualMachine',
    note: 'Generates a configure payload + script that creates the Azure Virtual Machine product and plan skeletons.',
    prerequisites: VM_PREREQUISITES
  },
  'azure-container': {
    api: 'product-ingestion',
    availability: 'scriptable',
    productIngestionType: 'azureContainer',
    note: 'Generates a configure payload + script that creates the Azure Container product and plan skeletons.',
    prerequisites: CONTAINER_PREREQUISITES
  },

  // Supported by Partner Center but not by this wizard's verified configure
  // schemas — create these manually in Partner Center.
  'azure-application':
    manual('Azure Application offers need managed-app / solution-template technical configuration that is created in Partner Center.'),
  'teams-app':
    manual('Teams apps are submitted to AppSource via Partner Center; link a transactable SaaS offer (which is scriptable) for billing.'),
  'office-add-in':
    manual('Office add-ins are submitted to AppSource via Partner Center; link a transactable SaaS offer for billing.'),
  'sharepoint-solution':
    manual('SharePoint solutions are submitted to AppSource via Partner Center; link a transactable SaaS offer for billing.'),
  'copilot-studio-agent':
    manual('Connectors & Copilot Studio agents are published through Partner Center / Power Platform and are not transactable.'),
  'dynamics-dataverse':
    manual('Dynamics 365 Dataverse apps are created in Partner Center with ISV app license management.'),
  'dynamics-operations':
    manual('Dynamics 365 Operations apps are listing-only and created in Partner Center.'),
  'business-central-connect':
    manual('Business Central connect apps are submitted to AppSource via Partner Center; link a SaaS offer for billing.'),
  'business-central-extend':
    manual('Business Central extend apps are submitted to AppSource via Partner Center.'),
  'power-bi-visual':
    manual('Power BI visuals are submitted to AppSource via Partner Center.'),
  'professional-service':
    manual('Professional service (consulting) offers are lead-based and created in Partner Center.'),
  'managed-service':
    manual('Managed service offers are configured with Azure Lighthouse manifests in Partner Center.')
};

export function getSubmissionCoverage(offerTypeId: string | undefined): SubmissionCoverage {
  if (offerTypeId && SUBMISSION_COVERAGE[offerTypeId]) {
    return SUBMISSION_COVERAGE[offerTypeId];
  }
  return manual('Create this offer in Partner Center.');
}

export function canGenerateSubmissionScript(coverage: SubmissionCoverage): boolean {
  return coverage.availability === 'scriptable' && !!coverage.productIngestionType;
}
