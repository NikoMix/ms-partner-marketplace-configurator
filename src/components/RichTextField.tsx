import { useRef, useState } from 'react';
import {
  Textarea,
  TabList,
  Tab,
  Button,
  Tooltip,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  TextBold20Regular,
  TextBulletList20Regular,
  TextParagraph20Regular,
  TextItalic20Regular,
  LinkRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: '8px' },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tools: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  preview: {
    minHeight: '180px',
    padding: '14px 16px',
    borderRadius: '6px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    lineHeight: '1.5',
    overflowWrap: 'anywhere'
  },
  empty: { color: tokens.colorNeutralForeground3, fontStyle: 'italic' }
});

export interface RichTextFieldProps {
  value: string;
  maxLength?: number;
  onChange: (value: string) => void;
}

/**
 * Strip anything unsafe before rendering author HTML in the preview pane:
 * <script> blocks, inline event handlers and javascript: URLs.
 */
function sanitize(html: string): string {
  return html
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

export function RichTextField({ value, maxLength, onChange }: RichTextFieldProps) {
  const styles = useStyles();
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  function surround(before: string, after: string, placeholder = '') {
    const ta = taRef.current;
    const start = ta?.selectionStart ?? value.length;
    const end = ta?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    const trimmed = maxLength ? next.slice(0, maxLength) : next;
    onChange(trimmed);
    const caret = start + before.length + selected.length;
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(caret, caret);
      }
    });
  }

  const tools = [
    {
      key: 'bold',
      label: 'Bold',
      icon: <TextBold20Regular />,
      run: () => surround('<strong>', '</strong>', 'bold text')
    },
    {
      key: 'italic',
      label: 'Italic',
      icon: <TextItalic20Regular />,
      run: () => surround('<em>', '</em>', 'emphasis')
    },
    {
      key: 'para',
      label: 'Paragraph',
      icon: <TextParagraph20Regular />,
      run: () => surround('<p>', '</p>\n', 'Paragraph text')
    },
    {
      key: 'list',
      label: 'Bullet list',
      icon: <TextBulletList20Regular />,
      run: () => surround('<ul>\n  <li>', '</li>\n</ul>\n', 'First item')
    },
    {
      key: 'link',
      label: 'Link',
      icon: <LinkRegular />,
      run: () => surround('<a href="https://">', '</a>', 'link text')
    }
  ];

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <TabList
          size="small"
          selectedValue={tab}
          onTabSelect={(_, d) => setTab(d.value as 'write' | 'preview')}
        >
          <Tab value="write">Write</Tab>
          <Tab value="preview">Preview</Tab>
        </TabList>
        {tab === 'write' && (
          <div className={styles.tools}>
            {tools.map((t) => (
              <Tooltip key={t.key} content={t.label} relationship="label">
                <Button
                  size="small"
                  appearance="subtle"
                  icon={t.icon}
                  aria-label={t.label}
                  onClick={t.run}
                />
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      {tab === 'write' ? (
        <Textarea
          value={value}
          resize="vertical"
          maxLength={maxLength}
          textarea={{ ref: taRef, style: { minHeight: '180px', fontFamily: 'monospace' } }}
          onChange={(_, d) => onChange(d.value)}
        />
      ) : value.trim() ? (
        <div
          className={styles.preview}
          dangerouslySetInnerHTML={{ __html: sanitize(value) }}
        />
      ) : (
        <div className={`${styles.preview} ${styles.empty}`}>Nothing to preview yet.</div>
      )}
    </div>
  );
}
