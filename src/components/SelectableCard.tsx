import type { ReactNode } from 'react';
import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '16px 18px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    fontFamily: 'inherit',
    color: 'inherit',
    cursor: 'pointer'
  }
});

interface SelectableCardProps {
  selected?: boolean;
  onSelect: () => void;
  children: ReactNode;
  ariaLabel?: string;
}

export function SelectableCard({ selected, onSelect, children, ariaLabel }: SelectableCardProps) {
  const styles = useStyles();
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      data-selected={selected ? 'true' : 'false'}
      className={mergeClasses(styles.card, 'selectable-card')}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
