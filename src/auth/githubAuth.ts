// GitHub OAuth "device flow" sign-in. Lets a partner authenticate with their
// own GitHub account instead of pasting a personal access token. The resulting
// user access token is stored in the same place as the PAT (browser-only) and
// used for AI inference.
//
// GitHub's device/token endpoints do not return CORS headers, so a pure
// browser app must route them through a configurable CORS proxy. The proxy URL
// (if any) is taken from AI settings; the GitHub URL is appended to it.

import type { AiSettings } from '../ai/prompts';

const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:device_code';

/** Scope requested for the device flow. Minimal — just identifies the user. */
const SCOPE = 'read:user';

export class GitHubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthError';
  }
}

export interface DeviceCodeResponse {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
}

function proxied(ai: AiSettings, url: string): string {
  const proxy = ai.corsProxy.trim();
  return proxy ? `${proxy}${url}` : url;
}

/**
 * Begin the device flow. Returns the user code to display and the URL where the
 * user enters it to authorize.
 */
export async function requestDeviceCode(ai: AiSettings): Promise<DeviceCodeResponse> {
  const clientId = ai.oauthClientId.trim();
  if (!clientId) {
    throw new GitHubAuthError(
      'No GitHub OAuth client id configured. Add one in Settings (or set VITE_GITHUB_OAUTH_CLIENT_ID at build time) to sign in with GitHub.'
    );
  }

  let res: Response;
  try {
    res = await fetch(proxied(ai, DEVICE_CODE_URL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, scope: SCOPE })
    });
  } catch (err) {
    throw new GitHubAuthError(
      `Could not reach GitHub. GitHub's sign-in endpoints need a CORS proxy when called from a browser — check the proxy setting. (${(err as Error).message})`
    );
  }

  if (!res.ok) {
    throw new GitHubAuthError(`GitHub device request failed (${res.status} ${res.statusText}).`);
  }

  const data = await res.json();
  if (data.error) {
    throw new GitHubAuthError(`GitHub error: ${data.error_description ?? data.error}`);
  }
  if (!data.device_code || !data.user_code || !data.verification_uri) {
    throw new GitHubAuthError('GitHub returned an unexpected device-code response.');
  }

  return {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    expiresIn: Number(data.expires_in) || 900,
    interval: Number(data.interval) || 5
  };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface PollOptions {
  /** Returns true to abort polling (e.g. the user cancelled). */
  shouldCancel?: () => boolean;
}

/**
 * Poll GitHub until the user authorizes (or the request fails/expires).
 * Resolves with the user access token.
 */
export async function pollForToken(
  ai: AiSettings,
  device: DeviceCodeResponse,
  options: PollOptions = {}
): Promise<string> {
  const clientId = ai.oauthClientId.trim();
  let intervalMs = device.interval * 1000;
  const deadline = Date.now() + device.expiresIn * 1000;

  while (Date.now() < deadline) {
    if (options.shouldCancel?.()) {
      throw new GitHubAuthError('Sign-in cancelled.');
    }
    await sleep(intervalMs);
    if (options.shouldCancel?.()) {
      throw new GitHubAuthError('Sign-in cancelled.');
    }

    let res: Response;
    try {
      res = await fetch(proxied(ai, ACCESS_TOKEN_URL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          device_code: device.deviceCode,
          grant_type: GRANT_TYPE
        })
      });
    } catch (err) {
      throw new GitHubAuthError(`Network error while waiting for authorization: ${(err as Error).message}`);
    }

    if (!res.ok) {
      throw new GitHubAuthError(`GitHub token request failed (${res.status} ${res.statusText}).`);
    }

    const data = await res.json();

    if (data.access_token) {
      return data.access_token as string;
    }

    switch (data.error) {
      case 'authorization_pending':
        continue;
      case 'slow_down':
        intervalMs += 5000;
        continue;
      case 'expired_token':
        throw new GitHubAuthError('The sign-in request expired before it was authorized. Please try again.');
      case 'access_denied':
        throw new GitHubAuthError('Authorization was denied.');
      default:
        throw new GitHubAuthError(`GitHub error: ${data.error_description ?? data.error ?? 'unknown'}`);
    }
  }

  throw new GitHubAuthError('Timed out waiting for authorization. Please try again.');
}
