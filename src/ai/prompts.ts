// Default GitHub Models settings and the editable system prompts that drive
// AI-assisted listing copy. Prompts are persisted to localStorage and can be
// edited/reset by the user in the AI settings panel.

export interface AiSettings {
  /** GitHub fine-grained PAT (models:read) or compatible API token. */
  token: string;
  /** Chat completions base endpoint. */
  endpoint: string;
  /** Chat model id, e.g. openai/gpt-4o. */
  model: string;
  /** Optional image (image-to-image / generation) endpoint, OpenAI-compatible. */
  imageEndpoint: string;
  /** Image model id, e.g. openai/dall-e-3 or a configured Azure deployment. */
  imageModel: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  token: '',
  endpoint: 'https://models.github.ai/inference',
  model: 'openai/gpt-4o',
  imageEndpoint: '',
  imageModel: 'openai/dall-e-3'
};

/**
 * Base instruction prepended to every copy-generation request. Gives the model
 * the persona and the marketplace context.
 */
export const DEFAULT_BASE_PROMPT = `You are an expert Microsoft commercial marketplace listing copywriter helping a Microsoft partner publish a compelling, compliant offer in Partner Center.

Write in clear, professional, benefit-led English aimed at IT and business decision makers. Be specific and credible — avoid hype, empty superlatives and unverifiable claims. Lead with customer value and outcomes, then capabilities. Respect Microsoft marketplace certification policies (no competitive disparagement, no pricing in the description, no unsupported claims). Never invent features, certifications, customers or metrics that were not provided. Return only the requested copy with no preamble, explanation or markdown code fences.`;

/** Per-field system prompts. Keyed by the RequiredField id. */
export const DEFAULT_FIELD_PROMPTS: Record<string, string> = {
  searchResultSummary: `Write a single-line search results summary of at most 100 characters. It must be punchy, keyword-rich and convey the core value in one sentence. No trailing period unless natural.`,
  shortDescription: `Write a short description of at most 256 characters (2–3 sentences). Summarize what the offer is, who it is for and the primary benefit. This appears near the top of the listing.`,
  description: `Write a full marketplace listing description (up to ~3000 characters). Structure it as: a strong opening value proposition paragraph; a "Key benefits" section (3–5 bullet-style lines); a "Key features" section (3–6 lines); and a short closing line about who it is for / next step. Use simple HTML (<p>, <strong>, <ul>, <li>) since the listing supports basic HTML.`,
  searchKeywords: `Suggest exactly 3 high-intent search keywords or short phrases a customer would use to find this offer. Return them as a single comma-separated line.`,
  getStarted: `Write concise "getting started" instructions telling the customer how to deploy or begin using the offer after they acquire it. Use short numbered steps.`
};

/** Prompt used when the user asks the AI to refine existing copy. */
export const DEFAULT_REFINE_PROMPT = `Improve the provided draft for clarity, persuasiveness and compliance while preserving its meaning and any concrete facts. Keep within the same length constraints. Return only the improved copy.`;
