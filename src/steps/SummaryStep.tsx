import { useState } from 'react';
import {
  Title3,
  Body1,
  Body1Strong,
  Caption1,
  Button,
  Badge,
  Divider,
  MessageBar,
  MessageBarBody,
  Spinner,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  ArrowDownload20Regular,
  DocumentText20Regular,
  CheckmarkCircle20Regular,
  Share20Regular,
  Checkmark20Regular
} from '@fluentui/react-icons';
import { useWizard } from '../state/WizardContext';
import { getOfferType } from '../data/catalog';
import { LISTING_OPTIONS } from '../data/types';
import { buildShareLink } from '../state/offerImport';
import { buildProjectZip, triggerDownload } from '../zip/templates';
import type { ProjectAsset, BillingZipContext, PlanSummary } from '../zip/templates';

const useStyles = makeStyles({
  panel: {
    padding: '20px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  row: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'baseline' },
  pillRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' },
  meta: { color: tokens.colorNeutralForeground3 },
  value: { whiteSpace: 'pre-wrap' }
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'offer';
}

export function SummaryStep() {
  const { state, dispatch } = useWizard();
  const styles = useStyles();
  const offer = state.offerTypeId ? getOfferType(state.offerTypeId) : undefined;

  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!offer) {
    return (
      <div className="step-body">
        <Title3 as="h2">Nothing to summarize yet</Title3>
        <Body1>Choose an offer type to build your plan.</Body1>
        <div style={{ marginTop: '16px' }}>
          <Button appearance="primary" onClick={() => dispatch({ type: 'GO_TO', index: 1 })}>
            Choose an offer type
          </Button>
        </div>
      </div>
    );
  }

  const offerName = state.fieldValues.offerName || offer.name;
  const selectedModels = offer.billingModels.filter((b) => state.selectedBillingModelIds.includes(b.id));
  const assetEntries = Object.entries(state.assets);

  function buildPlanObject() {
    return {
      offerType: { id: offer!.id, name: offer!.name, docUrl: offer!.docUrl },
      transactable: offer!.transactable,
      listingOption: state.listingOptionId ? LISTING_OPTIONS[state.listingOptionId].label : null,
      listing: offer!.requiredFields.reduce<Record<string, string>>((acc, f) => {
        acc[f.id] = state.fieldValues[f.id] ?? '';
        return acc;
      }, {}),
      billingModels: selectedModels.map((b) => b.label),
      plans: state.plans.map((p) => ({
        name: p.name,
        billingModel: offer!.billingModels.find((b) => b.id === p.billingModelId)?.label ?? p.billingModelId,
        price: p.price,
        cadence: p.cadence,
        notes: p.notes
      })),
      assets: assetEntries.map(([specId]) => `${specId}.png`)
    };
  }

  function listingMarkdown(): string {
    const lines = [`# ${offerName}`, ''];
    for (const f of offer!.requiredFields) {
      const v = state.fieldValues[f.id];
      if (v) {
        lines.push(`## ${f.label}`, '', v, '');
      }
    }
    return lines.join('\n');
  }

  function billingContext(): BillingZipContext | undefined {
    if (offer!.billingModels.length === 0) return undefined;
    const plans: PlanSummary[] = state.plans.map((p) => ({
      name: p.name,
      billingModel: offer!.billingModels.find((b) => b.id === p.billingModelId)?.label ?? p.billingModelId,
      price: p.price,
      cadence: p.cadence,
      notes: p.notes
    }));
    return {
      offerName,
      offerTypeName: offer!.name,
      billingZipKind: offer!.billingZipKind,
      billingModelLabels: selectedModels.map((b) => b.label),
      plans,
      language: state.billingLanguage
    };
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(buildPlanObject(), null, 2)], { type: 'application/json' });
    triggerDownload(blob, `${slugify(offerName)}-marketplace-plan.json`);
  }

  async function exportZip() {
    setError('');
    setZipBusy(true);
    try {
      const assets: ProjectAsset[] = assetEntries.map(([specId, dataUrl]) => ({
        filename: `${specId}.png`,
        dataUrl
      }));
      const blob = await buildProjectZip({
        plan: buildPlanObject(),
        listingMarkdown: listingMarkdown(),
        assets,
        billing: billingContext()
      });
      triggerDownload(blob, `${slugify(offerName)}-marketplace-project.zip`);
    } catch {
      setError('Could not build the project ZIP.');
    } finally {
      setZipBusy(false);
    }
  }

  async function copyShareLink() {
    setError('');
    try {
      const link = buildShareLink(state);
      if (!link) return;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the shareable link.');
    }
  }

  const filledFields = offer.requiredFields.filter((f) => (state.fieldValues[f.id] ?? '').trim()).length;
  const requiredAssets = offer.requiredAssets.filter((a) => a.required);
  const providedRequired = requiredAssets.filter((a) => state.assets[a.id]).length;

  return (
    <div className="step-body">
      <Title3 as="h2">Review &amp; export</Title3>
      <Body1>
        Here&apos;s everything you&apos;ve configured. Export a plan JSON for your records or a full
        project ZIP with your listing copy, generated assets and a billing starter.
      </Body1>

      <div className={styles.panel} style={{ marginTop: '20px' }}>
        <div className={styles.row}>
          <Body1Strong>{offer.name}</Body1Strong>
          <Badge appearance="tint" color="brand">
            {state.listingOptionId ? LISTING_OPTIONS[state.listingOptionId].label : 'No listing option'}
          </Badge>
        </div>
        <Caption1 className={styles.meta}>{offerName}</Caption1>
        <Divider />
        <div className={styles.row}>
          <Body1>Listing fields completed</Body1>
          <Caption1>
            {filledFields}/{offer.requiredFields.length}
          </Caption1>
        </div>
        <div className={styles.row}>
          <Body1>Required assets provided</Body1>
          <Caption1>
            {providedRequired}/{requiredAssets.length}
          </Caption1>
        </div>
        <div className={styles.row}>
          <Body1>Plans configured</Body1>
          <Caption1>{state.plans.length}</Caption1>
        </div>
        {selectedModels.length > 0 && (
          <>
            <Divider />
            <Body1Strong>Billing models</Body1Strong>
            <div className={styles.pillRow}>
              {selectedModels.map((b) => (
                <Badge key={b.id} appearance="outline" color="brand">
                  {b.label}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {offer.requiredFields.some((f) => (state.fieldValues[f.id] ?? '').trim()) && (
        <div className={styles.panel}>
          <Body1Strong>Listing copy</Body1Strong>
          {offer.requiredFields.map((f) => {
            const v = (state.fieldValues[f.id] ?? '').trim();
            if (!v) return null;
            return (
              <div key={f.id}>
                <Caption1 className={styles.meta}>{f.label}</Caption1>
                <Body1 className={styles.value} block>
                  {v}
                </Body1>
              </div>
            );
          })}
        </div>
      )}

      {providedRequired < requiredAssets.length && (
        <MessageBar intent="warning" style={{ marginBottom: '16px' }}>
          <MessageBarBody>
            Some required assets are still missing. You can add them on the Assets step before
            submitting to Partner Center.
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.actions}>
        <Button appearance="primary" icon={<ArrowDownload20Regular />} onClick={exportZip} disabled={zipBusy}>
          {zipBusy ? <Spinner size="tiny" /> : null}
          Download full project ZIP
        </Button>
        <Button icon={<DocumentText20Regular />} onClick={exportJson}>
          Export plan JSON
        </Button>
        <Button icon={copied ? <Checkmark20Regular /> : <Share20Regular />} onClick={copyShareLink}>
          {copied ? 'Link copied' : 'Copy shareable link'}
        </Button>
      </div>

      <Caption1 className={styles.meta} style={{ marginTop: '8px', display: 'block' }}>
        The shareable link reopens this wizard with your offering pre-filled and jumps to the first
        step that still needs input. Generated assets aren&apos;t included in the link.
      </Caption1>

      {error && (
        <MessageBar intent="error" style={{ marginTop: '12px' }}>
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.panel} style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckmarkCircle20Regular style={{ color: '#0067b8' }} />
          <Body1Strong>Next: publish in Partner Center</Body1Strong>
        </div>
        <Body1>
          Sign in to Partner Center, create a new {offer.name} offer, and use this plan, your
          listing copy, generated assets and the billing starter to complete and submit it for
          certification.
        </Body1>
      </div>
    </div>
  );
}
