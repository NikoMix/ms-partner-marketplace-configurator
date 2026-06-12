import type { ReactNode } from 'react';
import {
  Title3,
  Body1,
  Body1Strong,
  Caption1,
  Badge,
  Link,
  Divider,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  Cloud24Regular,
  Server24Regular,
  Apps24Regular,
  Grid24Regular,
  People24Regular,
  Sparkle24Regular,
  Open16Regular
} from '@fluentui/react-icons';
import { SelectableCard } from '../components/SelectableCard';
import { useWizard } from '../state/WizardContext';
import {
  CATEGORIES,
  CATEGORY_DIRECT_OFFER,
  getQuestionForCategory,
  getOfferType
} from '../data/catalog';
import type { Transactability } from '../data/types';

const useStyles = makeStyles({
  section: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' },
  cardInner: { display: 'flex', flexDirection: 'column', gap: '8px' },
  cardHead: { display: 'flex', alignItems: 'center', gap: '10px' },
  cardIcon: { color: '#0067b8', display: 'flex' },
  recommend: {
    marginTop: '8px',
    padding: '20px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  recommendHead: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  docLink: { display: 'inline-flex', alignItems: 'center', gap: '4px' }
});

function categoryIcon(icon: string): ReactNode {
  switch (icon) {
    case 'cloud':
      return <Cloud24Regular />;
    case 'server':
      return <Server24Regular />;
    case 'apps':
      return <Apps24Regular />;
    case 'grid':
      return <Grid24Regular />;
    case 'people':
      return <People24Regular />;
    case 'sparkle':
      return <Sparkle24Regular />;
    default:
      return <Grid24Regular />;
  }
}

function transactBadge(t: Transactability): { label: string; color: 'brand' | 'success' | 'informative' } {
  switch (t) {
    case 'yes':
      return { label: 'Transactable via Microsoft', color: 'success' };
    case 'via-saas':
      return { label: 'Transactable via linked SaaS', color: 'brand' };
    case 'no':
      return { label: 'List-only (not transactable)', color: 'informative' };
    default:
      return { label: 'List-only', color: 'informative' };
  }
}

export function DecideStep() {
  const { state, dispatch } = useWizard();
  const styles = useStyles();

  const categoryId = state.categoryId;
  const question = categoryId ? getQuestionForCategory(categoryId) : undefined;
  const offer = state.offerTypeId ? getOfferType(state.offerTypeId) : undefined;

  function selectCategory(id: string) {
    dispatch({ type: 'SELECT_CATEGORY', categoryId: id });
    const direct = CATEGORY_DIRECT_OFFER[id];
    if (direct) dispatch({ type: 'SET_OFFER_TYPE', offerTypeId: direct });
  }

  return (
    <div className="step-body">
      <div className={styles.section}>
        <Title3 as="h2">What are you building?</Title3>
        <Body1>
          Choose the product family that best matches your solution. We&apos;ll recommend the
          right Partner Center offer type and show exactly what&apos;s required to publish it.
        </Body1>
        <div className="card-grid">
          {CATEGORIES.map((c) => (
            <SelectableCard
              key={c.id}
              ariaLabel={c.name}
              selected={categoryId === c.id}
              onSelect={() => selectCategory(c.id)}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon}>{categoryIcon(c.icon)}</span>
                  <Body1Strong>{c.name}</Body1Strong>
                </div>
                <Caption1>{c.description}</Caption1>
              </div>
            </SelectableCard>
          ))}
        </div>
      </div>

      {question && (
        <div className={styles.section}>
          <Title3 as="h3">{question.prompt}</Title3>
          {question.helper && <Body1>{question.helper}</Body1>}
          <div className="card-grid">
            {question.options.map((opt) => (
              <SelectableCard
                key={opt.id}
                ariaLabel={opt.label}
                selected={state.answers[question.id] === opt.id}
                onSelect={() => {
                  dispatch({ type: 'ANSWER', questionId: question.id, optionId: opt.id });
                  if (opt.offerTypeId) {
                    dispatch({ type: 'SET_OFFER_TYPE', offerTypeId: opt.offerTypeId });
                  }
                }}
              >
                <div className={styles.cardInner}>
                  <Body1Strong>{opt.label}</Body1Strong>
                  {opt.description && <Caption1>{opt.description}</Caption1>}
                </div>
              </SelectableCard>
            ))}
          </div>
        </div>
      )}

      {offer && (
        <div className={styles.recommend}>
          <Caption1>Recommended offer type</Caption1>
          <div className={styles.recommendHead}>
            <Title3 as="h3">{offer.name}</Title3>
            <Badge appearance="tint" color={transactBadge(offer.transactable).color}>
              {transactBadge(offer.transactable).label}
            </Badge>
          </div>
          <Body1>{offer.tagline}</Body1>
          <Divider />
          <Body1>{offer.description}</Body1>
          <Link className={styles.docLink} href={offer.docUrl} target="_blank" rel="noreferrer">
            View the Microsoft Learn documentation <Open16Regular />
          </Link>
        </div>
      )}
    </div>
  );
}
