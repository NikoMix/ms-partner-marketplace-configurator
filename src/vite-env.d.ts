/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** OAuth App client id used for the GitHub device-flow sign-in. */
  readonly VITE_GITHUB_OAUTH_CLIENT_ID?: string;
  /**
   * Optional CORS proxy prefix for GitHub's device/token endpoints, which do
   * not send CORS headers. The GitHub URL is appended to this prefix.
   */
  readonly VITE_CORS_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
