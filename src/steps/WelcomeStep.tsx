import { Button, Title2, Body1, Body1Strong, makeStyles, tokens } from '@fluentui/react-components';
import {
  ArrowRight20Regular,
  Sparkle32Regular,
  Image32Regular,
  ArrowDownload32Regular,
  Apps32Regular
} from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { useWizard } from '../state/WizardContext';

const useStyles = makeStyles({
  intro: { maxWidth: '760px' },
  lead: { fontSize: '18px', lineHeight: '1.6', color: '#242424', marginTop: '8px' },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '28px',
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr'
    }
  },
  feature: {
    display: 'flex',
    gap: '16px',
    padding: '24px',
    borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    alignItems: 'flex-start'
  },
  featureIcon: { color: '#0067b8', flexShrink: 0 },
  featureTitle: { fontSize: '16px', marginBottom: '4px' },
  cta: {
    marginTop: '32px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  note: { color: '#605e5c' }
});

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Apps32Regular />,
    title: 'Pick the right offer type',
    body: 'Answer a few questions and get a recommended Partner Center offer type with its publishing requirements.'
  },
  {
    icon: <Sparkle32Regular />,
    title: 'AI-assisted listing copy',
    body: 'Draft and refine your search summary, descriptions and keywords with GitHub Models — bring your own token.'
  },
  {
    icon: <Image32Regular />,
    title: 'Generate marketplace assets',
    body: 'Create correctly sized logos, screenshots and hero images, or upload and auto-resize your own.'
  },
  {
    icon: <ArrowDownload32Regular />,
    title: 'Billing starter template',
    body: 'Download a ready-to-extend ZIP for SaaS metering, Azure app/VM/container billing and pricing.'
  }
];

export function WelcomeStep() {
  const { dispatch } = useWizard();
  const styles = useStyles();

  return (
    <div className="step-body">
      <div className={styles.intro}>
        <Title2 as="h2">Plan and build your Microsoft Marketplace offer</Title2>
        <p className={styles.lead}>
          This guided wizard walks you through choosing a commercial marketplace offer
          type, understanding exactly what Partner Center requires to publish it, and
          generating the listing copy, visual assets and billing scaffolding you need to
          go live faster.
        </p>
      </div>

      <div className={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.feature}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div>
              <Body1Strong block className={styles.featureTitle}>{f.title}</Body1Strong>
              <Body1 block>{f.body}</Body1>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <Button
          appearance="primary"
          size="large"
          icon={<ArrowRight20Regular />}
          iconPosition="after"
          onClick={() => dispatch({ type: 'NEXT' })}
        >
          Start planning
        </Button>
        <Body1 className={styles.note}>
          Everything runs in your browser. AI features are optional and use a token you provide.
        </Body1>
      </div>
    </div>
  );
}
