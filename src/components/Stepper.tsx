import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { CheckmarkRegular } from '@fluentui/react-icons';
import { STEPS } from '../state/WizardContext';

const useStyles = makeStyles({
  rail: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px',
    padding: '20px 0 8px',
    maxWidth: '960px',
    margin: '0 auto',
    width: '100%'
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '1 1 0',
    position: 'relative',
    cursor: 'default',
    minWidth: 0
  },
  clickable: { cursor: 'pointer' },
  connector: {
    position: 'absolute',
    top: '14px',
    height: '2px',
    backgroundColor: tokens.colorNeutralStroke2,
    zIndex: 0
  },
  connectorDone: { backgroundColor: '#0067b8' },
  circle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `2px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
    zIndex: 1,
    transitionProperty: 'all',
    transitionDuration: '150ms'
  },
  circleActive: {
    backgroundColor: '#0067b8',
    borderTopColor: '#0067b8',
    borderRightColor: '#0067b8',
    borderBottomColor: '#0067b8',
    borderLeftColor: '#0067b8',
    color: '#ffffff'
  },
  circleDone: {
    backgroundColor: '#0067b8',
    borderTopColor: '#0067b8',
    borderRightColor: '#0067b8',
    borderBottomColor: '#0067b8',
    borderLeftColor: '#0067b8',
    color: '#ffffff'
  },
  label: {
    marginTop: '8px',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
    maxWidth: '110px'
  },
  labelActive: { color: tokens.colorNeutralForeground1, fontWeight: 600 }
});

interface StepperProps {
  current: number;
  maxReached: number;
  onJump: (index: number) => void;
}

export function Stepper({ current, maxReached, onJump }: StepperProps) {
  const s = useStyles();
  return (
    <nav className={s.rail} aria-label="Wizard progress">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const reachable = i <= maxReached;
        return (
          <div
            key={step.id}
            className={mergeClasses(s.step, reachable && s.clickable)}
            onClick={reachable ? () => onJump(i) : undefined}
            role={reachable ? 'button' : undefined}
            aria-current={active ? 'step' : undefined}
          >
            {i > 0 && (
              <span
                className={mergeClasses(s.connector, i <= current && s.connectorDone)}
                style={{ right: '50%', width: 'calc(100% - 15px)' }}
                aria-hidden
              />
            )}
            <span
              className={mergeClasses(s.circle, active && s.circleActive, done && s.circleDone)}
            >
              {done ? <CheckmarkRegular /> : i + 1}
            </span>
            <span className={mergeClasses(s.label, active && s.labelActive)}>{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
