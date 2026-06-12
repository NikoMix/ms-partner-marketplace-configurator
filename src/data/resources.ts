// Curated "Mastering the Marketplace" learning resources.
// Links are harvested from https://microsoft.github.io/Mastering-the-Marketplace
// Videos resolve to partner.microsoft.com training assets; PDFs live under the course site.

export interface LearningModule {
  title: string;
  videoUrl?: string;
  pdfUrl?: string;
}

export interface LearningCourse {
  id: string;
  title: string;
  description: string;
  url: string;
  /** Offer-type IDs this course applies to. Empty array = general / applies to all. */
  offerTypeIds: string[];
  modules: LearningModule[];
}

export const MASTERING_HUB_URL = 'https://microsoft.github.io/Mastering-the-Marketplace/';

const SITE = 'https://microsoft.github.io/Mastering-the-Marketplace';
const VIDEO = 'https://partner.microsoft.com/en-us/training/assets/detail';

export const LEARNING_COURSES: LearningCourse[] = [
  {
    id: 'choose-offer-type',
    title: 'Choose your offer type',
    description:
      'A decision tree that walks you through selecting the right commercial marketplace offer type for what you are building.',
    url: `${SITE}/biz/select-offer-type/`,
    offerTypeIds: [],
    modules: []
  },
  {
    id: 'partner-center',
    title: 'Partner Center essentials',
    description:
      'Set up your account, create and manage offers, configure private offers, and read marketplace insights in Partner Center.',
    url: `${SITE}/partner-center/`,
    offerTypeIds: [],
    modules: []
  },
  {
    id: 'saas',
    title: 'SaaS offers',
    description:
      'Plan, publish and technically integrate a transactable SaaS offer, including Microsoft Entra ID configuration and the SaaS fulfillment APIs.',
    url: `${SITE}/saas/dev/`,
    offerTypeIds: [
      'saas',
      'ai-app-agent',
      'teams-app',
      'office-add-in',
      'sharepoint-solution',
      'copilot-studio-agent',
      'business-central-connect',
      'power-bi-visual'
    ],
    modules: [
      {
        title: 'SaaS offer overview',
        videoUrl: `${VIDEO}/saas-offer-overview-mp4`,
        pdfUrl: `${SITE}/saas/pdfs/01-SaaS-Offer-Overview.pdf`
      },
      {
        title: 'Publishing a SaaS offer',
        videoUrl: `${VIDEO}/publishing-a-saas-offer-mp4`,
        pdfUrl: `${SITE}/saas/pdfs/03.1-Publishing-a-SaaS-Offer.pdf`
      },
      {
        title: 'SaaS offer technical overview',
        videoUrl: `${VIDEO}/saas-offer-technical-overview-mp4`,
        pdfUrl: `${SITE}/saas/pdfs/04-SaaS-Offer-Technical-Overview.pdf`
      },
      {
        title: 'Microsoft Entra ID configuration for your SaaS offer',
        videoUrl: `${VIDEO}/microsoft-entra-id-configuration-for-your-saas-offer-mp4`,
        pdfUrl: `${SITE}/saas/pdfs/05-Azure-AD-Application-Registrations%20-%20v3.pdf`
      }
    ]
  },
  {
    id: 'saas-accelerator',
    title: 'SaaS Accelerator',
    description:
      'A free, open-source reference implementation that handles SaaS subscription provisioning, metered billing and the customer landing page so you can publish faster.',
    url: `${SITE}/saas-accelerator/`,
    offerTypeIds: ['saas', 'ai-app-agent'],
    modules: [
      {
        title: 'SaaS Accelerator introduction',
        videoUrl: `${VIDEO}/saas-accelerator-introduction-mp4`
      },
      {
        title: 'Hands-on tour',
        videoUrl: `${VIDEO}/saas-accelerator-hands-on-tour-mp4`
      },
      {
        title: 'Architecture',
        videoUrl: `${VIDEO}/saas-accelerator-architecture-mp4`,
        pdfUrl: `${SITE}/saas-accelerator/pdfs/03-architecture.pdf`
      },
      {
        title: 'Installing with the Azure portal Cloud Shell',
        videoUrl: `${VIDEO}/installing-the-saas-accelerator-with-the-azure-portal-cloud-shell-mp4`
      }
    ]
  },
  {
    id: 'vm',
    title: 'Virtual Machine offers',
    description:
      'Create, generalize, capture and publish an Azure Virtual Machine offer through Partner Center.',
    url: `${SITE}/vm/`,
    offerTypeIds: ['azure-vm'],
    modules: [
      {
        title: 'Creating VM offers overview',
        videoUrl: `${VIDEO}/creating-vm-offers-overview-mp4`
      },
      {
        title: 'Partner Center for VMs overview',
        videoUrl: `${VIDEO}/partner-center-for-vms-overview-mp4`
      },
      {
        title: 'Generalizing and capturing a VM image',
        videoUrl: `${VIDEO}/generalizing-and-capturing-a-vm-image-overview-mp4`
      },
      {
        title: 'Publishing your VM offer with Partner Center',
        videoUrl: `${VIDEO}/publishing-your-vm-offer-with-partner-center-demo-mp4`
      }
    ]
  },
  {
    id: 'container',
    title: 'Container offers',
    description:
      'Package Kubernetes application (CNAB) bundles, push solution images to Azure Container Registry, and publish a container offer with metered billing.',
    url: `${SITE}/container/`,
    offerTypeIds: ['azure-container'],
    modules: [
      {
        title: 'Container offer for Kubernetes apps overview',
        videoUrl: `${VIDEO}/container-offer-for-kubernetes-apps-overview-mp4`,
        pdfUrl: `${SITE}/container/pdfs/01.1-overview-2.pdf`
      },
      {
        title: 'Container offer billing overview',
        videoUrl: `${VIDEO}/container-offer-billing-overview-mp4`,
        pdfUrl: `${SITE}/container/pdfs/01.2-billing-overview.pdf`
      },
      {
        title: 'Container offer technical overview',
        videoUrl: `${VIDEO}/container-offer-technical-overview-mp4`,
        pdfUrl: `${SITE}/container/pdfs/02.1-technical-overview.pdf`
      }
    ]
  },
  {
    id: 'ama',
    title: 'Azure Application & Managed Applications',
    description:
      'Build solution-template and managed-application offers, choose deployment options, and configure billing and pricing for Azure applications.',
    url: `${SITE}/ama/`,
    offerTypeIds: ['azure-application'],
    modules: [
      {
        title: 'Managed Applications overview',
        videoUrl: `${VIDEO}/managed-applications-overview-mp4`,
        pdfUrl: `${SITE}/ama/pdfs/02.0-ma-overview.pdf`
      },
      {
        title: 'Billing and pricing for Azure applications',
        videoUrl: `${VIDEO}/billing-and-pricing-for-azure-applications-mp4`
      },
      {
        title: 'Managed application deployment options',
        videoUrl: `${VIDEO}/managed-application-deployment-options-mp4`,
        pdfUrl: `${SITE}/ama/pdfs/03.0-ma-deployment-options.pdf`
      }
    ]
  },
  {
    id: 'pro-services',
    title: 'Professional Service offers',
    description:
      'Publish a professional-services offer that supports your own software or Microsoft software, and sell it through private offers.',
    url: `${SITE}/pro-services/`,
    offerTypeIds: ['professional-service', 'managed-service'],
    modules: [
      {
        title: 'Professional service offers overview',
        videoUrl: `${VIDEO}/professional-service-offers-overview-mp4`
      },
      {
        title: 'Publishing an offer supporting your software',
        videoUrl: `${VIDEO}/publishing-a-professional-service-offer-supporting-your-software-mp4`
      },
      {
        title: 'Creating a private offer for your professional service',
        videoUrl: `${VIDEO}/creating-a-private-offer-to-sell-your-professional-service-offer-mp4`
      }
    ]
  }
];

/**
 * Returns the learning courses relevant to a given offer type. Offer-specific
 * courses are listed first, followed by the general courses (empty offerTypeIds).
 */
export function getCoursesForOffer(offerTypeId: string | undefined): LearningCourse[] {
  const general = LEARNING_COURSES.filter((c) => c.offerTypeIds.length === 0);
  if (!offerTypeId) return general;
  const specific = LEARNING_COURSES.filter((c) => c.offerTypeIds.includes(offerTypeId));
  return [...specific, ...general];
}
