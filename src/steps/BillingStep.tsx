import { useState } from 'react';
import {
  Title3,
  Body1,
  Body1Strong,
  Caption1,
  Button,
  Checkbox,
  Input,
  Textarea,
  Field,
  Dropdown,
  Option,
  Divider,
  MessageBar,
  MessageBarBody,
  Spinner,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Add20Regular, Delete20Regular, ArrowDownload20Regular } from '@fluentui/react-icons';
import { useWizard } from '../state/WizardContext';
import { getOfferType } from '../data/catalog';
import { buildBillingZip, triggerDownload } from '../zip/templates';
import type { PlanSummary } from '../zip/templates';

const useStyles = makeStyles({
  section: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  modelList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  planCard: {
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '12px'
  },
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  planHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  zipRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' },
  meta: { color: tokens.colorNeutralForeground3 }
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'offer';
}

export function BillingStep() {
  const { state, dispatch } = useWizard();
  const styles = useStyles();
  const offer = state.offerTypeId ? getOfferType(state.offerTypeId) : undefined;

  const [zipBusy, setZipBusy] = useState(false);
  const [zipError, setZipError] = useState('');

  if (!offer) {
    return (
      <div className="step-body">
        <Title3 as="h2">Select an offer type first</Title3>
        <Body1>Choose an offer type to configure billing and plans.</Body1>
        <div style={{ marginTop: '16px' }}>
          <Button appearance="primary" onClick={() => dispatch({ type: 'GO_TO', index: 1 })}>
            Choose an offer type
          </Button>
        </div>
      </div>
    );
  }

  if (offer.billingModels.length === 0) {
    return (
      <div className="step-body">
        <Title3 as="h2">Billing &amp; plans</Title3>
        <MessageBar intent="info">
          <MessageBarBody>
            {offer.name} is a list-only offer type. Pricing and contracting happen outside the
            marketplace transaction flow, so there are no plans to configure here. You can still
            export your plan and assets on the next step.
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const offerName = state.fieldValues.offerName || offer.name;

  function addPlan() {
    const firstId = state.selectedBillingModelIds[0] ?? offer!.billingModels[0]?.id ?? '';
    const model = offer!.billingModels.find((b) => b.id === firstId);
    const cadence = model?.cadences?.[0] ?? (model?.metered ? 'Metered usage' : '');
    dispatch({
      type: 'ADD_PLAN',
      plan: {
        id: crypto.randomUUID(),
        name: `Plan ${state.plans.length + 1}`,
        billingModelId: firstId,
        price: '',
        cadence,
        notes: ''
      }
    });
  }

  async function downloadZip() {
    setZipError('');
    setZipBusy(true);
    try {
      const billingModelLabels = state.selectedBillingModelIds
        .map((id) => offer!.billingModels.find((b) => b.id === id)?.label)
        .filter((x): x is string => !!x);
      const plans: PlanSummary[] = state.plans.map((p) => ({
        name: p.name,
        billingModel: offer!.billingModels.find((b) => b.id === p.billingModelId)?.label ?? p.billingModelId,
        price: p.price,
        cadence: p.cadence,
        notes: p.notes
      }));
      const blob = await buildBillingZip({
        offerName,
        offerTypeName: offer!.name,
        billingZipKind: offer!.billingZipKind,
        billingModelLabels,
        plans
      });
      triggerDownload(blob, `${slugify(offerName)}-billing-starter.zip`);
    } catch {
      setZipError('Could not build the billing starter ZIP.');
    } finally {
      setZipBusy(false);
    }
  }

  return (
    <div className="step-body">
      <Title3 as="h2">Billing &amp; plans</Title3>
      <Body1>
        Select the billing models you&apos;ll offer, configure plans, then download a starter
        template wired for {offer.billingZipKind.replace(/-/g, ' ')} billing.
      </Body1>

      <div className={styles.section} style={{ marginTop: '16px' }}>
        <Body1Strong>Billing models</Body1Strong>
        <div className={styles.modelList}>
          {offer.billingModels.map((b) => (
            <Checkbox
              key={b.id}
              checked={state.selectedBillingModelIds.includes(b.id)}
              onChange={() => dispatch({ type: 'TOGGLE_BILLING', billingModelId: b.id })}
              label={
                <span>
                  <Body1>{b.label}</Body1> <Caption1 className={styles.meta}>— {b.description}</Caption1>
                </span>
              }
            />
          ))}
        </div>
      </div>

      <Divider />

      <div className={styles.section} style={{ marginTop: '16px' }}>
        <div className={styles.planHead}>
          <Body1Strong>Plans &amp; pricing</Body1Strong>
          <Button size="small" icon={<Add20Regular />} onClick={addPlan}>
            Add plan
          </Button>
        </div>

        {state.plans.length === 0 && (
          <Caption1 className={styles.meta}>No plans yet — add one to model your pricing.</Caption1>
        )}

        {state.plans.map((p) => {
          const model = offer.billingModels.find((b) => b.id === p.billingModelId);
          return (
            <div key={p.id} className={styles.planCard}>
              <div className={styles.planHead}>
                <Body1Strong>{p.name || 'Untitled plan'}</Body1Strong>
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Delete20Regular />}
                  onClick={() => dispatch({ type: 'REMOVE_PLAN', planId: p.id })}
                >
                  Remove
                </Button>
              </div>
              <div className={styles.planGrid}>
                <Field label="Plan name">
                  <Input
                    value={p.name}
                    onChange={(_, d) => dispatch({ type: 'UPDATE_PLAN', plan: { ...p, name: d.value } })}
                  />
                </Field>
                <Field label="Billing model">
                  <Dropdown
                    value={model?.label ?? ''}
                    selectedOptions={[p.billingModelId]}
                    onOptionSelect={(_, d) => {
                      const nextId = d.optionValue ?? p.billingModelId;
                      const nextModel = offer.billingModels.find((b) => b.id === nextId);
                      const cadence = nextModel?.cadences?.[0] ?? (nextModel?.metered ? 'Metered usage' : '');
                      dispatch({ type: 'UPDATE_PLAN', plan: { ...p, billingModelId: nextId, cadence } });
                    }}
                  >
                    {offer.billingModels.map((b) => (
                      <Option key={b.id} value={b.id} text={b.label}>
                        {b.label}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Price">
                  <Input
                    value={p.price}
                    placeholder="e.g. 99"
                    contentBefore="$"
                    onChange={(_, d) => dispatch({ type: 'UPDATE_PLAN', plan: { ...p, price: d.value } })}
                  />
                </Field>
                <Field label="Cadence">
                  {model?.cadences && model.cadences.length > 0 ? (
                    <Dropdown
                      value={p.cadence}
                      selectedOptions={[p.cadence]}
                      onOptionSelect={(_, d) =>
                        dispatch({ type: 'UPDATE_PLAN', plan: { ...p, cadence: d.optionValue ?? p.cadence } })
                      }
                    >
                      {model.cadences.map((c) => (
                        <Option key={c} value={c} text={c}>
                          {c}
                        </Option>
                      ))}
                    </Dropdown>
                  ) : (
                    <Input value={p.cadence || 'Metered usage'} disabled />
                  )}
                </Field>
              </div>
              <Field label="Plan notes / what's included">
                <Textarea
                  value={p.notes}
                  resize="vertical"
                  onChange={(_, d) => dispatch({ type: 'UPDATE_PLAN', plan: { ...p, notes: d.value } })}
                />
              </Field>
            </div>
          );
        })}
      </div>

      <Divider />

      <div className={styles.zipRow}>
        <Button
          appearance="primary"
          icon={zipBusy ? <Spinner size="tiny" /> : <ArrowDownload20Regular />}
          disabled={zipBusy}
          onClick={downloadZip}
        >
          Download billing starter ZIP
        </Button>
        <Caption1 className={styles.meta}>
          Includes metering/webhook code, pricing config and integration docs for{' '}
          {offer.billingZipKind.replace(/-/g, ' ')}.
        </Caption1>
      </div>
      {zipError && (
        <MessageBar intent="error" style={{ marginTop: '12px' }}>
          <MessageBarBody>{zipError}</MessageBarBody>
        </MessageBar>
      )}
    </div>
  );
}
