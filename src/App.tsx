import { useEffect, useState } from 'react';
import { Button, makeStyles } from '@fluentui/react-components';
import { ArrowLeft20Regular, ArrowRight20Regular, ArrowReset20Regular } from '@fluentui/react-icons';
import { TopBar } from './components/TopBar';
import { HeroHeader } from './components/HeroHeader';
import { Stepper } from './components/Stepper';
import { SettingsPanel } from './components/SettingsPanel';
import { WelcomeStep } from './steps/WelcomeStep';
import { DecideStep } from './steps/DecideStep';
import { OverviewStep } from './steps/OverviewStep';
import { ListingStep } from './steps/ListingStep';
import { AssetsStep } from './steps/AssetsStep';
import { BillingStep } from './steps/BillingStep';
import { SummaryStep } from './steps/SummaryStep';
import { useWizard, STEPS } from './state/WizardContext';

const useStyles = makeStyles({
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #e1dfdd'
  },
  leftGroup: { display: 'flex', gap: '12px', alignItems: 'center' },
  spacer: { flex: 1 }
});

interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
}

const HERO: Record<string, HeroContent> = {
  welcome: {
    eyebrow: 'Microsoft commercial marketplace',
    title: 'Plan and build your marketplace offer',
    subtitle:
      'A guided wizard that helps Microsoft partners choose the right offer type, meet every Partner Center requirement, draft listing copy with AI, generate assets and ship a billing starter.'
  },
  decide: {
    eyebrow: 'Step 1 · Offer type',
    title: 'Choose what you are building',
    subtitle: 'Answer a few questions and we will recommend the right Partner Center offer type.'
  },
  overview: {
    eyebrow: 'Step 2 · Requirements',
    title: 'Listing options and requirements',
    subtitle: 'See how customers will acquire your offer and exactly what you need to publish it.'
  },
  listing: {
    eyebrow: 'Step 3 · Listing details',
    title: 'Write your marketplace listing',
    subtitle: 'Fill in the listing fields, with AI to draft and refine your copy.'
  },
  assets: {
    eyebrow: 'Step 4 · Assets',
    title: 'Create your marketplace assets',
    subtitle: 'Upload or generate correctly sized logos, screenshots and hero images.'
  },
  billing: {
    eyebrow: 'Step 5 · Billing & plans',
    title: 'Configure pricing and billing',
    subtitle: 'Model your plans and download a billing starter template wired for your offer.'
  },
  summary: {
    eyebrow: 'Step 6 · Review',
    title: 'Review and export',
    subtitle: 'Confirm everything, then export your plan and a full project package.'
  }
};

function renderStep(id: string) {
  switch (id) {
    case 'welcome':
      return <WelcomeStep />;
    case 'decide':
      return <DecideStep />;
    case 'overview':
      return <OverviewStep />;
    case 'listing':
      return <ListingStep />;
    case 'assets':
      return <AssetsStep />;
    case 'billing':
      return <BillingStep />;
    case 'summary':
      return <SummaryStep />;
    default:
      return null;
  }
}

export function App() {
  const { state, dispatch } = useWizard();
  const styles = useStyles();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [maxReached, setMaxReached] = useState(0);

  useEffect(() => {
    setMaxReached((m) => Math.max(m, state.stepIndex));
  }, [state.stepIndex]);

  const stepId = STEPS[state.stepIndex].id;
  const hero = HERO[stepId] ?? HERO.welcome;
  const isFirst = state.stepIndex === 0;
  const isSummary = stepId === 'summary';

  function canProceed(): boolean {
    if (stepId === 'decide') return !!state.offerTypeId;
    if (stepId === 'overview') return !!state.listingOptionId;
    return true;
  }

  function resetAll() {
    if (window.confirm('Start over? This resets the wizard. Your AI settings and prompts are kept.')) {
      dispatch({ type: 'RESET_ALL' });
    }
  }

  return (
    <>
      <TopBar onOpenSettings={() => setSettingsOpen(true)} onHome={() => dispatch({ type: 'GO_TO', index: 0 })} />
      <HeroHeader eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} />

      <main className="content-area">
        <div className="page-shell">
          <Stepper
            current={state.stepIndex}
            maxReached={maxReached}
            onJump={(index) => dispatch({ type: 'GO_TO', index })}
          />

          {renderStep(stepId)}

          {!isFirst && (
            <div className={styles.nav}>
              <div className={styles.leftGroup}>
                <Button appearance="secondary" icon={<ArrowLeft20Regular />} onClick={() => dispatch({ type: 'BACK' })}>
                  Back
                </Button>
                {isSummary && (
                  <Button appearance="subtle" icon={<ArrowReset20Regular />} onClick={resetAll}>
                    Start over
                  </Button>
                )}
              </div>
              <div className={styles.spacer} />
              {!isSummary && (
                <Button
                  appearance="primary"
                  icon={<ArrowRight20Regular />}
                  iconPosition="after"
                  disabled={!canProceed()}
                  onClick={() => dispatch({ type: 'NEXT' })}
                >
                  Next
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>Unofficial partner tool.</span>
          <span>GitHub Copilot Token will be utilized for AI Features.</span>
        </div>
      </footer>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
