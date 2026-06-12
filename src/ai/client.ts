import type { AiSettings } from './prompts';

export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiError';
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

function trimEndpoint(endpoint: string): string {
  return endpoint.replace(/\/+$/, '');
}

/**
 * Next-generation OpenAI models (gpt-5 family and the o-series reasoning
 * models) reject the legacy `max_tokens` parameter and require
 * `max_completion_tokens` instead. They also only accept the default
 * `temperature` (1), so a custom temperature must be omitted. Detect them by
 * model id (after stripping any `openai/` publisher prefix).
 */
function isNextGenModel(model: string): boolean {
  const id = model.replace(/^.*\//, '').toLowerCase();
  return /^(o\d|gpt-5)/.test(id);
}

export async function chat(
  ai: AiSettings,
  messages: ChatMessage[],
  opts: ChatOptions = {}
): Promise<string> {
  if (!ai.token) {
    throw new AiError(
      'No GitHub Models token set. Open Settings and paste a token with the Models permission.'
    );
  }
  if (!ai.endpoint) {
    throw new AiError('No chat endpoint configured. Set one in Settings.');
  }

  const url = `${trimEndpoint(ai.endpoint)}/chat/completions`;
  const nextGen = isNextGenModel(ai.model);
  const body: Record<string, unknown> = {
    model: ai.model,
    messages
  };
  if (nextGen) {
    // gpt-5 / o-series: legacy `max_tokens` is rejected and a custom
    // `temperature` is unsupported. Reasoning tokens also consume the budget,
    // so use a higher floor to avoid empty visible completions.
    body.max_completion_tokens = opts.maxTokens ?? 4000;
  } else {
    body.temperature = opts.temperature ?? 0.7;
    body.max_tokens = opts.maxTokens ?? 1200;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ai.token}`
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new AiError(
      `Network error contacting the model endpoint: ${(err as Error).message}`
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore body read errors */
    }
    throw new AiError(
      `Model request failed (${res.status} ${res.statusText}). ${detail.slice(0, 300)}`
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new AiError('The model returned an empty response. Try again or adjust your prompt.');
  }
  return content.trim();
}

export interface FieldCopyRequest {
  basePrompt: string;
  fieldPrompt: string;
  context: string;
}

export async function generateFieldCopy(
  ai: AiSettings,
  req: FieldCopyRequest
): Promise<string> {
  const system = `${req.basePrompt}\n\n${req.fieldPrompt}`;
  return chat(
    ai,
    [
      { role: 'system', content: system },
      { role: 'user', content: req.context }
    ],
    { temperature: 0.7 }
  );
}

export interface RefineCopyRequest {
  basePrompt: string;
  refinePrompt: string;
  fieldPrompt: string;
  current: string;
  context: string;
}

export async function refineFieldCopy(
  ai: AiSettings,
  req: RefineCopyRequest
): Promise<string> {
  const system = `${req.basePrompt}\n\n${req.fieldPrompt}\n\n${req.refinePrompt}`;
  const user = `${req.context}\n\nCurrent draft to improve:\n"""\n${req.current}\n"""`;
  return chat(
    ai,
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.6 }
  );
}

export interface CoachCopyRequest {
  basePrompt: string;
  coachPrompt: string;
  fieldPrompt: string;
  current: string;
  context: string;
}

/**
 * Non-destructive coaching: returns improvement tips/questions about the
 * current draft without rewriting it.
 */
export async function coachFieldCopy(
  ai: AiSettings,
  req: CoachCopyRequest
): Promise<string> {
  const system = `${req.basePrompt}\n\nField goal for reference:\n${req.fieldPrompt}\n\n${req.coachPrompt}`;
  const draft = req.current.trim() || '(the field is currently empty)';
  const user = `${req.context}\n\nCurrent draft to coach:\n"""\n${draft}\n"""`;
  return chat(
    ai,
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.5 }
  );
}

export interface ImageRequest {
  prompt: string;
  width: number;
  height: number;
  sourceDataUrl?: string;
}

function nearestOpenAiSize(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 1.3) return '1792x1024';
  if (ratio < 0.77) return '1024x1792';
  return '1024x1024';
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function generateImage(ai: AiSettings, req: ImageRequest): Promise<string> {
  if (!ai.token) {
    throw new AiError('No token set. Add a token in Settings to generate images.');
  }
  if (!ai.imageEndpoint) {
    throw new AiError(
      'No image endpoint configured. Image generation needs an OpenAI-compatible image endpoint (set it in Settings). You can still upload assets manually.'
    );
  }

  const base = trimEndpoint(ai.imageEndpoint);
  const size = nearestOpenAiSize(req.width, req.height);

  let res: Response;
  try {
    if (req.sourceDataUrl) {
      const form = new FormData();
      form.append('model', ai.imageModel);
      form.append('prompt', req.prompt);
      form.append('size', size);
      form.append('response_format', 'b64_json');
      const blob = await dataUrlToBlob(req.sourceDataUrl);
      form.append('image', blob, 'source.png');
      res = await fetch(`${base}/images/edits`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${ai.token}` },
        body: form
      });
    } else {
      res = await fetch(`${base}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ai.token}`
        },
        body: JSON.stringify({
          model: ai.imageModel,
          prompt: req.prompt,
          size,
          response_format: 'b64_json',
          n: 1
        })
      });
    }
  } catch (err) {
    throw new AiError(`Network error contacting the image endpoint: ${(err as Error).message}`);
  }

  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore body read errors */
    }
    throw new AiError(
      `Image request failed (${res.status} ${res.statusText}). ${detail.slice(0, 300)}`
    );
  }

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  const directUrl = data?.data?.[0]?.url;
  if (typeof b64 === 'string' && b64) {
    return `data:image/png;base64,${b64}`;
  }
  if (typeof directUrl === 'string' && directUrl) {
    return directUrl;
  }
  throw new AiError('The image endpoint returned no image data.');
}
