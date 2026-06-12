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
  },
  dimmed: {
    opacity: 0.45,
    filter: 'grayscale(0.6)'
  }
});

interface SelectableCardProps {
  selected?: boolean;
  /** Visually de-emphasise an unselected option (single-select clarity). Stays clickable. */
  dimmed?: boolean;
  onSelect: () => void;
  children: ReactNode;
  ariaLabel?: string;
}

export function SelectableCard({ selected, dimmed, onSelect, children, ariaLabel }: SelectableCardProps) {
  const styles = useStyles();
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      data-selected={selected ? 'true' : 'false'}
      className={mergeClasses(styles.card, 'selectable-card', dimmed && styles.dimmed)}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
