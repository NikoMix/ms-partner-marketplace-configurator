import { useState } from 'react';
import {
  Title3,
  Body1,
  Button,
  Field,
  Input,
  Textarea,
  Caption1,
  MessageBar,
  MessageBarBody,
  MessageBarActions,
  Spinner,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  Sparkle20Regular,
  ArrowClockwise20Regular,
  Lightbulb20Regular,
  Dismiss20Regular
} from '@fluentui/react-icons';
import { useWizard } from '../state/WizardContext';
import { getOfferType } from '../data/catalog';
import { LISTING_OPTIONS } from '../data/types';
import { generateFieldCopy, refineFieldCopy, coachFieldCopy, AiError } from '../ai/client';
import { RichTextField } from '../components/RichTextField';

const useStyles = makeStyles({
  field: {
    padding: '18px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' },
  aiRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' },
  counter: { color: tokens.colorNeutralForeground3, whiteSpace: 'nowrap' },
  desc: { color: tokens.colorNeutralForeground3 },
  coachBody: { whiteSpace: 'pre-wrap' }
});

export function ListingStep() {
  const { state, dispatch } = useWizard();
  const styles = useStyles();
  const offer = state.offerTypeId ? getOfferType(state.offerTypeId) : undefined;
  const aiReady = Boolean(state.ai.token.trim());

  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coachBusy, setCoachBusy] = useState<Record<string, boolean>>({});
  const [coachTips, setCoachTips] = useState<Record<string, string>>({});

  if (!offer) {
    return (
      <div className="step-body">
        <Title3 as="h2">Select an offer type first</Title3>
        <Body1>Choose an offer type before filling in listing details.</Body1>
        <div style={{ marginTop: '16px' }}>
          <Button appearance="primary" onClick={() => dispatch({ type: 'GO_TO', index: 1 })}>
            Choose an offer type
          </Button>
        </div>
      </div>
    );
  }

  function buildContext(excludeId: string): string {
    const parts: string[] = [
      `Offer type: ${offer!.name}`,
      `Tagline: ${offer!.tagline}`,
      `Description: ${offer!.description}`
    ];
    if (state.listingOptionId) {
      parts.push(`Listing option: ${LISTING_OPTIONS[state.listingOptionId].label}`);
    }
    for (const f of offer!.requiredFields) {
      const v = state.fieldValues[f.id];
      if (v && f.id !== excludeId) parts.push(`${f.label}: ${v}`);
    }
    return parts.join('\n');
  }

  async function runDraft(fieldId: string) {
    setErrors((e) => ({ ...e, [fieldId]: '' }));
    setBusy((b) => ({ ...b, [fieldId]: true }));
    try {
      const text = await generateFieldCopy(state.ai, {
        basePrompt: state.prompts.base,
        fieldPrompt: state.prompts.fields[fieldId] ?? '',
        context: buildContext(fieldId)
      });
      dispatch({ type: 'SET_FIELD', fieldId, value: text.trim() });
    } catch (err) {
      setErrors((e) => ({ ...e, [fieldId]: err instanceof AiError ? err.message : 'Generation failed.' }));
    } finally {
      setBusy((b) => ({ ...b, [fieldId]: false }));
    }
  }

  async function runRefine(fieldId: string) {
    const current = state.fieldValues[fieldId] ?? '';
    if (!current.trim()) return;
    setErrors((e) => ({ ...e, [fieldId]: '' }));
    setBusy((b) => ({ ...b, [fieldId]: true }));
    try {
      const text = await refineFieldCopy(state.ai, {
        basePrompt: state.prompts.base,
        refinePrompt: state.prompts.refine,
        fieldPrompt: state.prompts.fields[fieldId] ?? '',
        current,
        context: buildContext(fieldId)
      });
      dispatch({ type: 'SET_FIELD', fieldId, value: text.trim() });
    } catch (err) {
      setErrors((e) => ({ ...e, [fieldId]: err instanceof AiError ? err.message : 'Refine failed.' }));
    } finally {
      setBusy((b) => ({ ...b, [fieldId]: false }));
    }
  }

  async function runCoach(fieldId: string) {
    setErrors((e) => ({ ...e, [fieldId]: '' }));
    setCoachBusy((b) => ({ ...b, [fieldId]: true }));
    try {
      const tips = await coachFieldCopy(state.ai, {
        basePrompt: state.prompts.base,
        coachPrompt: state.prompts.coach,
        fieldPrompt: state.prompts.fields[fieldId] ?? '',
        current: state.fieldValues[fieldId] ?? '',
        context: buildContext(fieldId)
      });
      setCoachTips((t) => ({ ...t, [fieldId]: tips.trim() }));
    } catch (err) {
      setErrors((e) => ({ ...e, [fieldId]: err instanceof AiError ? err.message : 'Coach failed.' }));
    } finally {
      setCoachBusy((b) => ({ ...b, [fieldId]: false }));
    }
  }

  return (
    <div className="step-body">
      <Title3 as="h2">Listing details</Title3>
      <Body1>
        Complete the fields Partner Center needs for your {offer.name} listing. Use the AI
        helpers to draft or refine copy — configure your GitHub Models token in Settings.
      </Body1>

      {!aiReady && (
        <MessageBar intent="info" style={{ marginTop: '12px' }}>
          <MessageBarBody>
            Sign in with GitHub or add a token in Settings to enable AI drafting, refining and
            coaching.
          </MessageBarBody>
        </MessageBar>
      )}

      <div style={{ marginTop: '20px' }}>
        {offer.requiredFields.map((f) => {
          const value = state.fieldValues[f.id] ?? '';
          return (
            <div key={f.id} className={styles.field}>
              <div className={styles.labelRow}>
                <Body1>{f.label}</Body1>
                {f.maxLength ? (
                  <Caption1 className={styles.counter}>
                    {value.length}/{f.maxLength}
                  </Caption1>
                ) : null}
              </div>
              {f.description && <Caption1 className={styles.desc}>{f.description}</Caption1>}

              <Field>
                {f.richText ? (
                  <RichTextField
                    value={value}
                    maxLength={f.maxLength}
                    onChange={(v) => dispatch({ type: 'SET_FIELD', fieldId: f.id, value: v })}
                  />
                ) : f.multiline ? (
                  <Textarea
                    value={value}
                    resize="vertical"
                    maxLength={f.maxLength}
                    onChange={(_, d) => dispatch({ type: 'SET_FIELD', fieldId: f.id, value: d.value })}
                  />
                ) : (
                  <Input
                    value={value}
                    maxLength={f.maxLength}
                    onChange={(_, d) => dispatch({ type: 'SET_FIELD', fieldId: f.id, value: d.value })}
                  />
                )}
              </Field>

              {f.aiAssist && (
                <div className={styles.aiRow}>
                  <Button
                    size="small"
                    icon={busy[f.id] ? <Spinner size="tiny" /> : <Sparkle20Regular />}
                    disabled={!!busy[f.id] || !aiReady}
                    onClick={() => runDraft(f.id)}
                  >
                    Draft with AI
                  </Button>
                  <Button
                    size="small"
                    appearance="subtle"
                    icon={<ArrowClockwise20Regular />}
                    disabled={!!busy[f.id] || !value.trim() || !aiReady}
                    onClick={() => runRefine(f.id)}
                  >
                    Refine
                  </Button>
                  {f.multiline && (
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={coachBusy[f.id] ? <Spinner size="tiny" /> : <Lightbulb20Regular />}
                      disabled={!!coachBusy[f.id] || !aiReady}
                      onClick={() => runCoach(f.id)}
                    >
                      Coach
                    </Button>
                  )}
                </div>
              )}

              {coachTips[f.id] && (
                <MessageBar intent="info">
                  <MessageBarBody className={styles.coachBody}>{coachTips[f.id]}</MessageBarBody>
                  <MessageBarActions
                    containerAction={
                      <Button
                        appearance="transparent"
                        aria-label="Dismiss coaching tips"
                        icon={<Dismiss20Regular />}
                        onClick={() => setCoachTips((t) => ({ ...t, [f.id]: '' }))}
                      />
                    }
                  />
                </MessageBar>
              )}

              {errors[f.id] && (
                <MessageBar intent="error">
                  <MessageBarBody>{errors[f.id]}</MessageBarBody>
                </MessageBar>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
