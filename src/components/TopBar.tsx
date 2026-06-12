import { makeStyles, tokens, Button, Tooltip } from '@fluentui/react-components';
import { Settings24Regular, Grid24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  bar: {
    height: '48px',
    backgroundColor: '#000000',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '24px',
    paddingRight: '16px',
    gap: '12px'
  },
  lockup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: tokens.fontFamilyBase,
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '-0.01em'
  },
  logo: {
    display: 'grid',
    gridTemplateColumns: '10px 10px',
    gridTemplateRows: '10px 10px',
    gap: '2px'
  },
  sq: { width: '10px', height: '10px' },
  sep: {
    width: '1px',
    height: '24px',
    backgroundColor: 'rgba(255,255,255,0.4)',
    margin: '0 4px'
  },
  product: { fontWeight: 400, opacity: 0.95 },
  spacer: { flexGrow: 1 },
  action: { color: '#ffffff' }
});

interface TopBarProps {
  onOpenSettings: () => void;
  onHome: () => void;
}

export function TopBar({ onOpenSettings, onHome }: TopBarProps) {
  const s = useStyles();
  return (
    <header className={s.bar}>
      <div className={s.lockup}>
        <span className={s.logo} aria-hidden>
          <span className={s.sq} style={{ background: '#f25022' }} />
          <span className={s.sq} style={{ background: '#7fba00' }} />
          <span className={s.sq} style={{ background: '#00a4ef' }} />
          <span className={s.sq} style={{ background: '#ffb900' }} />
        </span>
        Microsoft
      </div>
      <span className={s.sep} />
      <span className={s.product}>Marketplace Offer Wizard</span>
      <span className={s.spacer} />
      <Tooltip content="Start over / overview" relationship="label">
        <Button appearance="transparent" className={s.action} icon={<Grid24Regular />} onClick={onHome} />
      </Tooltip>
      <Tooltip content="AI settings & system prompts" relationship="label">
        <Button
          appearance="transparent"
          className={s.action}
          icon={<Settings24Regular />}
          onClick={onOpenSettings}
        >
          Settings
        </Button>
      </Tooltip>
    </header>
  );
}
