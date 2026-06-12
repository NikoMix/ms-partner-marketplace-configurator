import {
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
  Input,
  Textarea,
  Field,
  Divider,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Link,
  MessageBar,
  MessageBarBody,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Dismiss24Regular, ArrowResetRegular, Delete24Regular } from '@fluentui/react-icons';
import { useRef, useState } from 'react';
import { useWizard } from '../state/WizardContext';
import { DEFAULT_FIELD_PROMPTS } from '../ai/prompts';
import { BASE_LISTING_FIELDS } from '../data/common';
import {
  requestDeviceCode,
  pollForToken,
  type DeviceCodeResponse
} from '../auth/githubAuth';

const useStyles = makeStyles({
  section: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  grow: { flex: '1 1 220px' },
  hint: { fontSize: '12px', color: tokens.colorNeutralForeground3 },
  promptArea: { width: '100%' },
  resetRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '4px' },
  localData: { marginTop: '24px' },
  signinBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 14px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2
  },
  signinRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  userCode: {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '3px',
    color: tokens.colorBrandForeground1
  }
});

const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  BASE_LISTING_FIELDS.map((f) => [f.id, f.label])
);

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const s = useStyles();
  const { state, dispatch } = useWizard();
  const { ai, prompts } = state;

  const [device, setDevice] = useState<DeviceCodeResponse | null>(null);
  const [signinBusy, setSigninBusy] = useState(false);
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const cancelRef = useRef(false);

  async function handleSignIn() {
    setSigninError(null);
    setSignedIn(false);
    setSigninBusy(true);
    cancelRef.current = false;
    try {
      const dc = await requestDeviceCode(ai);
      setDevice(dc);
      const token = await pollForToken(ai, dc, { shouldCancel: () => cancelRef.current });
      dispatch({ type: 'SET_AI', ai: { token } });
      setSignedIn(true);
      setDevice(null);
    } catch (err) {
      if (!cancelRef.current) {
        setSigninError(err instanceof Error ? err.message : String(err));
      }
      setDevice(null);
    } finally {
      setSigninBusy(false);
    }
  }

  function handleCancelSignIn() {
    cancelRef.current = true;
    setDevice(null);
    setSigninBusy(false);
  }

  return (
    <OverlayDrawer open={open} position="end" size="large" onOpenChange={(_, d) => !d.open && onClose()}>
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} aria-label="Close" />
          }
        >
          AI settings & system prompts
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <MessageBar intent="info" style={{ marginBottom: 16 }}>
          <MessageBarBody>
            Sign in with GitHub to use your own account's access, or bring your own token.
            Inference runs from your browser directly to the model endpoint — your credentials are
            stored only in this browser's localStorage and are never sent anywhere else.
          </MessageBarBody>
        </MessageBar>

        <div className={s.section}>
          <strong>Sign in with GitHub</strong>
          <span className={s.hint}>
            Authorize with your GitHub account instead of pasting a token. We use GitHub's device
            flow — you'll get a short code to enter on github.com. The resulting access token is kept
            only in this browser.
          </span>

          {device ? (
            <div className={s.signinBox}>
              <span className={s.hint}>Enter this code on GitHub to authorize:</span>
              <div className={s.signinRow}>
                <span className={s.userCode}>{device.userCode}</span>
                <Link href={device.verificationUri} target="_blank">
                  Open {device.verificationUri}
                </Link>
              </div>
              <div className={s.signinRow}>
                <Spinner size="tiny" label="Waiting for authorization…" />
                <Button appearance="subtle" onClick={handleCancelSignIn}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={s.row}>
              <Button appearance="primary" disabled={signinBusy} onClick={handleSignIn}>
                {signinBusy ? 'Starting…' : 'Sign in with GitHub'}
              </Button>
            </div>
          )}

          {signedIn && (
            <MessageBar intent="success">
              <MessageBarBody>Signed in. Your GitHub token is set below.</MessageBarBody>
            </MessageBar>
          )}
          {signinError && (
            <MessageBar intent="error">
              <MessageBarBody>{signinError}</MessageBarBody>
            </MessageBar>
          )}

          <Accordion collapsible>
            <AccordionItem value="oauth-advanced">
              <AccordionHeader>Sign-in configuration (advanced)</AccordionHeader>
              <AccordionPanel>
                <div className={s.row}>
                  <Field label="OAuth App client id" className={s.grow}>
                    <Input
                      value={ai.oauthClientId}
                      placeholder="Iv1.xxxxxxxxxxxx"
                      onChange={(_, d) => dispatch({ type: 'SET_AI', ai: { oauthClientId: d.value } })}
                    />
                  </Field>
                  <Field label="CORS proxy prefix" className={s.grow}>
                    <Input
                      value={ai.corsProxy}
                      placeholder="https://your-proxy/"
                      onChange={(_, d) => dispatch({ type: 'SET_AI', ai: { corsProxy: d.value } })}
                    />
                  </Field>
                </div>
                <span className={s.hint}>
                  Sign-in needs a GitHub OAuth App (with device flow enabled) — its client id can be
                  baked in at build time via <code>VITE_GITHUB_OAUTH_CLIENT_ID</code> or set here.
                  GitHub's sign-in endpoints don't allow direct browser calls, so a CORS proxy prefix
                  is required (the GitHub URL is appended to it). Prefer a token below if you can't
                  run a proxy.
                </span>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>

        <Divider>Or use a token</Divider>

        <div className={s.section}>
          <Field label="GitHub Models token (fine-grained PAT with models: read)">
            <Input
              type="password"
              value={ai.token}
              placeholder="github_pat_..."
              onChange={(_, d) => dispatch({ type: 'SET_AI', ai: { token: d.value } })}
            />
          </Field>
          <span className={s.hint}>
            Create one at{' '}
            <Link href="https://github.com/settings/personal-access-tokens" target="_blank">
              github.com/settings/personal-access-tokens
            </Link>{' '}
            and grant the <strong>Models</strong> permission. Learn more about{' '}
            <Link href="https://docs.github.com/github-models" target="_blank">
              GitHub Models
            </Link>
            .
          </span>
          <div className={s.row}>
            <Field label="Chat endpoint" className={s.grow}>
              <Input
                value={ai.endpoint}
                onChange={(_, d) => dispatch({ type: 'SET_AI', ai: { endpoint: d.value } })}
              />
            </Field>
            <Field label="Chat model" className={s.grow}>
              <Input
                value={ai.model}
                onChange={(_, d) => dispatch({ type: 'SET_AI', ai: { model: d.value } })}
              />
            </Field>
          </div>
          <div className={s.row}>
            <Field label="Image endpoint (optional, OpenAI-compatible)" className={s.grow}>
              <Input
                value={ai.imageEndpoint}
                placeholder="https://..."
                onChange={(_, d) => dispatch({ type: 'SET_AI', ai: { imageEndpoint: d.value } })}
              />
            </Field>
            <Field label="Image model" className={s.grow}>
              <Input
                value={ai.imageModel}
                onChange={(_, d) => dispatch({ type: 'SET_AI', ai: { imageModel: d.value } })}
              />
            </Field>
          </div>
          <span className={s.hint}>
            GitHub Models provides text and embeddings only — it does not offer an image-generation
            API. To create marketplace assets with AI, point the image endpoint at a separate
            OpenAI-compatible image service (e.g. Azure OpenAI or the OpenAI Images API) and supply a
            matching token. Leave it blank to upload and auto-resize assets manually.
          </span>
        </div>

        <Divider>System prompts</Divider>
        <p className={s.hint}>
          These prompts steer the AI copywriting. Edit them to match your tone and offer, then reset
          to defaults anytime.
        </p>

        <Accordion multiple collapsible>
          <AccordionItem value="base">
            <AccordionHeader>Base prompt (applies to all copy)</AccordionHeader>
            <AccordionPanel>
              <Textarea
                className={s.promptArea}
                resize="vertical"
                rows={8}
                value={prompts.base}
                onChange={(_, d) => dispatch({ type: 'SET_BASE_PROMPT', value: d.value })}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="refine">
            <AccordionHeader>Refine prompt (when improving a draft)</AccordionHeader>
            <AccordionPanel>
              <Textarea
                className={s.promptArea}
                resize="vertical"
                rows={4}
                value={prompts.refine}
                onChange={(_, d) => dispatch({ type: 'SET_REFINE_PROMPT', value: d.value })}
              />
            </AccordionPanel>
          </AccordionItem>
          {Object.keys(DEFAULT_FIELD_PROMPTS).map((fieldId) => (
            <AccordionItem value={fieldId} key={fieldId}>
              <AccordionHeader>{FIELD_LABELS[fieldId] ?? fieldId}</AccordionHeader>
              <AccordionPanel>
                <Textarea
                  className={s.promptArea}
                  resize="vertical"
                  rows={5}
                  value={prompts.fields[fieldId] ?? ''}
                  onChange={(_, d) =>
                    dispatch({ type: 'SET_FIELD_PROMPT', fieldId, value: d.value })
                  }
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <div className={s.resetRow}>
          <Button
            appearance="subtle"
            icon={<ArrowResetRegular />}
            onClick={() => dispatch({ type: 'RESET_PROMPTS' })}
          >
            Reset prompts to defaults
          </Button>
        </div>

        <Divider className={s.localData} />

        <div className={s.section} style={{ marginTop: 20 }}>
          <strong>Local data</strong>
          <span className={s.hint}>
            Everything you enter — contact &amp; support details, listing copy, selected
            plans, generated assets and these AI settings — is saved automatically in this
            browser so you don't have to re-enter it next time. Nothing is sent to a server.
          </span>
          <div className={s.row}>
            <Dialog>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="outline" icon={<Delete24Regular />}>
                  Clear all locally stored data
                </Button>
              </DialogTrigger>
              <DialogSurface>
                <DialogBody>
                  <DialogTitle>Clear all locally stored data?</DialogTitle>
                  <DialogContent>
                    This permanently removes everything saved in this browser — your offer
                    selections, contact &amp; support details, listing copy, plans, generated
                    assets, the AI token and any customised prompts. This can't be undone.
                  </DialogContent>
                  <DialogActions>
                    <DialogTrigger disableButtonEnhancement>
                      <Button appearance="secondary">Cancel</Button>
                    </DialogTrigger>
                    <DialogTrigger disableButtonEnhancement>
                      <Button
                        appearance="primary"
                        icon={<Delete24Regular />}
                        onClick={() => dispatch({ type: 'CLEAR_ALL' })}
                      >
                        Clear everything
                      </Button>
                    </DialogTrigger>
                  </DialogActions>
                </DialogBody>
              </DialogSurface>
            </Dialog>
          </div>
        </div>
      </DrawerBody>
    </OverlayDrawer>
  );
}
