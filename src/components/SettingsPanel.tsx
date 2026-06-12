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
import { useWizard } from '../state/WizardContext';
import { DEFAULT_FIELD_PROMPTS } from '../ai/prompts';
import { BASE_LISTING_FIELDS } from '../data/common';

const useStyles = makeStyles({
  section: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  grow: { flex: '1 1 220px' },
  hint: { fontSize: '12px', color: tokens.colorNeutralForeground3 },
  promptArea: { width: '100%' },
  resetRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '4px' },
  localData: { marginTop: '24px' }
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
            Bring your own token. Inference runs from your browser directly to the model endpoint —
            your token is stored only in this browser's localStorage and is never sent anywhere else.
          </MessageBarBody>
        </MessageBar>

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
