import {
  Title3,
  Body1,
  Body1Strong,
  Caption1,
  Button,
  Badge,
  Link,
  Divider,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { Open16Regular } from '@fluentui/react-icons';
import { SelectableCard } from '../components/SelectableCard';
import { LearningResources } from '../components/LearningResources';
import { useWizard } from '../state/WizardContext';
import { getOfferType } from '../data/catalog';
import { LISTING_OPTIONS } from '../data/types';

const useStyles = makeStyles({
  section: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' },
  cardInner: { display: 'flex', flexDirection: 'column', gap: '6px' },
  panel: {
    padding: '20px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  pillRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  docLink: { display: 'inline-flex', alignItems: 'center', gap: '4px' },
  note: { color: tokens.colorNeutralForeground3 }
});

export function OverviewStep() {
  const { state, dispatch } = useWizard();
  const styles = useStyles();
  const offer = state.offerTypeId ? getOfferType(state.offerTypeId) : undefined;

  if (!offer) {
    return (
      <div className="step-body">
        <Title3 as="h2">Select an offer type first</Title3>
        <Body1>Go back to the offer-type step to choose what you&apos;re building.</Body1>
        <div style={{ marginTop: '16px' }}>
          <Button appearance="primary" onClick={() => dispatch({ type: 'GO_TO', index: 1 })}>
            Choose an offer type
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="step-body">
      <div className={styles.section}>
        <Title3 as="h2">How do you want customers to acquire it?</Title3>
        <Body1>
          {offer.name} supports the following listing options. Pick the call to action your
          buyers will see in the marketplace.
        </Body1>
        <div className="card-grid">
          {offer.listingOptions.map((id) => {
            const lo = LISTING_OPTIONS[id];
            return (
              <SelectableCard
                key={id}
                ariaLabel={lo.label}
                selected={state.listingOptionId === id}
                dimmed={state.listingOptionId !== undefined && state.listingOptionId !== id}
                onSelect={() => dispatch({ type: 'SET_LISTING_OPTION', listingOptionId: id })}
              >
                <div className={styles.cardInner}>
                  <Body1Strong>{lo.label}</Body1Strong>
                  <Caption1>{lo.description}</Caption1>
                </div>
              </SelectableCard>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <Title3 as="h2">What Partner Center will require</Title3>
        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <Body1Strong>Listing fields</Body1Strong>
            <ul className="req-list">
              {offer.requiredFields.map((f) => (
                <li key={f.id}>
                  <Body1>{f.label}</Body1>
                  {f.maxLength ? <Caption1 className={styles.note}> · max {f.maxLength} chars</Caption1> : null}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <Body1Strong>Visual assets</Body1Strong>
            <ul className="req-list">
              {offer.requiredAssets.map((a) => (
                <li key={a.id}>
                  <Body1>
                    {a.label}
                    {a.width && a.height ? ` (${a.width}×${a.height})` : ''}
                  </Body1>
                  {a.required ? (
                    <Badge appearance="tint" color="danger" size="small" style={{ marginLeft: 8 }}>
                      required
                    </Badge>
                  ) : (
                    <Badge appearance="tint" color="informative" size="small" style={{ marginLeft: 8 }}>
                      optional
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <Body1Strong>Billing models</Body1Strong>
            {offer.billingModels.length ? (
              <div className={styles.pillRow}>
                {offer.billingModels.map((b) => (
                  <Badge key={b.id} appearance="outline" color="brand">
                    {b.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <Caption1 className={styles.note}>
                This offer type is list-only — pricing is handled outside the marketplace
                transaction flow.
              </Caption1>
            )}
            <Divider />
            <Body1Strong>Transactability</Body1Strong>
            <Body1>{offer.transactable === 'yes' ? 'Sold and billed through Microsoft.' : offer.transactable === 'via-saas' ? 'Transacted through a linked SaaS offer.' : 'Listed only; no marketplace transaction.'}</Body1>
            {offer.transactabilityNote && <Caption1 className={styles.note}>{offer.transactabilityNote}</Caption1>}
          </div>
        </div>
        <Link className={styles.docLink} href={offer.docUrl} target="_blank" rel="noreferrer">
          Full requirements on Microsoft Learn <Open16Regular />
        </Link>

        <Divider />

        <div className={styles.section}>
          <Title3 as="h3">Further learning — Mastering the Marketplace</Title3>
          <Body1 className={styles.note}>
            Curated videos and guides to help you publish this offer type successfully.
          </Body1>
          <LearningResources offerTypeId={offer.id} />
        </div>
      </div>
    </div>
  );
}
