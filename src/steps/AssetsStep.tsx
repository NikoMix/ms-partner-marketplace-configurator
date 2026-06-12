import { useState } from 'react';
import {
  Title3,
  Body1,
  Body1Strong,
  Caption1,
  Button,
  Badge,
  MessageBar,
  MessageBarBody,
  Spinner,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import {
  Sparkle20Regular,
  ArrowUpload20Regular,
  ArrowDownload20Regular,
  Delete20Regular
} from '@fluentui/react-icons';
import { useWizard } from '../state/WizardContext';
import { getOfferType } from '../data/catalog';
import { generateImage, AiError } from '../ai/client';
import type { AssetSpec } from '../data/types';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '18px',
    marginTop: '20px'
  },
  card: {
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  preview: {
    width: '100%',
    height: '160px',
    borderRadius: '6px',
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  empty: { color: tokens.colorNeutralForeground3 },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  meta: { color: tokens.colorNeutralForeground3 },
  groupHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '28px'
  },
  groupHint: { color: tokens.colorNeutralForeground3, marginTop: '2px' }
});

function resizeToCover(src: string, w: number, h: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Could not load image'));
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function pickImage(onFile: (file: File) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const f = input.files?.[0];
    if (f) onFile(f);
  };
  input.click();
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function AssetsStep() {
  const { state, dispatch } = useWizard();
  const styles = useStyles();
  const offer = state.offerTypeId ? getOfferType(state.offerTypeId) : undefined;
  const aiReady = Boolean(state.ai.token.trim());

  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!offer) {
    return (
      <div className="step-body">
        <Title3 as="h2">Select an offer type first</Title3>
        <Body1>Choose an offer type to see its required marketplace assets.</Body1>
        <div style={{ marginTop: '16px' }}>
          <Button appearance="primary" onClick={() => dispatch({ type: 'GO_TO', index: 1 })}>
            Choose an offer type
          </Button>
        </div>
      </div>
    );
  }

  async function handleUpload(specId: string, w: number, h: number, file: File) {
    setErrors((e) => ({ ...e, [specId]: '' }));
    setBusy((b) => ({ ...b, [specId]: true }));
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const resized = await resizeToCover(dataUrl, w, h);
      dispatch({ type: 'SET_ASSET', specId, dataUrl: resized });
    } catch {
      setErrors((e) => ({ ...e, [specId]: 'Could not process that image.' }));
    } finally {
      setBusy((b) => ({ ...b, [specId]: false }));
    }
  }

  async function handleGenerate(specId: string, label: string, notes: string | undefined, w: number, h: number) {
    setErrors((e) => ({ ...e, [specId]: '' }));
    setBusy((b) => ({ ...b, [specId]: true }));
    try {
      const source = state.assets[specId];
      const offerName = state.fieldValues.offerName || offer!.name;
      const prompt = [
        `Professional Microsoft commercial marketplace ${label.toLowerCase()} for "${offerName}".`,
        offer!.tagline,
        notes ?? '',
        source
          ? 'Refine and improve the provided image while keeping its core concept.'
          : 'Clean, modern, enterprise SaaS aesthetic with subtle Microsoft Fluent styling. No text.'
      ]
        .filter(Boolean)
        .join(' ');

      const raw = await generateImage(state.ai, {
        prompt,
        width: w,
        height: h,
        sourceDataUrl: source
      });

      let finalUrl = raw;
      try {
        finalUrl = await resizeToCover(raw, w, h);
      } catch {
        if (raw.startsWith('data:')) throw new AiError('Generated image could not be processed.');
      }
      dispatch({ type: 'SET_ASSET', specId, dataUrl: finalUrl });
    } catch (err) {
      setErrors((e) => ({ ...e, [specId]: err instanceof AiError ? err.message : 'Image generation failed.' }));
    } finally {
      setBusy((b) => ({ ...b, [specId]: false }));
    }
  }

  const requiredAssets = offer.requiredAssets.filter((a) => a.required);
  const optionalAssets = offer.requiredAssets.filter((a) => !a.required);

  function renderCard(a: AssetSpec) {
    const current = state.assets[a.id];
    const w = a.width ?? 0;
    const h = a.height ?? 0;
    const canGenerate = !!a.aiGenerable && w > 0 && h > 0;
    return (
      <div key={a.id} className={styles.card}>
        <div className={styles.head}>
          <Body1Strong>{a.label}</Body1Strong>
          <Badge appearance="tint" color={a.required ? 'danger' : 'informative'} size="small">
            {a.required ? 'required' : 'optional'}
          </Badge>
        </div>
        <Caption1 className={styles.meta}>
          {w > 0 && h > 0 ? `${w}×${h}px · ` : ''}
          {a.format.toUpperCase()}
          {a.maxCount ? ` · up to ${a.maxCount}` : ''}
        </Caption1>
        {a.notes && <Caption1 className={styles.meta}>{a.notes}</Caption1>}

        <div className={styles.preview}>
          {current ? (
            <img className="asset-thumb" src={current} alt={`${a.label} preview`} />
          ) : (
            <Caption1 className={styles.empty}>No image yet</Caption1>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            size="small"
            icon={<ArrowUpload20Regular />}
            disabled={!!busy[a.id]}
            onClick={() => pickImage((file) => handleUpload(a.id, w || 512, h || 512, file))}
          >
            Upload
          </Button>
          {canGenerate && (
            <Button
              size="small"
              appearance="primary"
              icon={busy[a.id] ? <Spinner size="tiny" /> : <Sparkle20Regular />}
              disabled={!!busy[a.id] || !aiReady}
              onClick={() => handleGenerate(a.id, a.label, a.notes, w, h)}
            >
              {current ? 'Refine with AI' : 'Generate'}
            </Button>
          )}
          {current && (
            <>
              <Button
                size="small"
                appearance="subtle"
                icon={<ArrowDownload20Regular />}
                onClick={() => downloadDataUrl(current, `${a.id}.png`)}
              >
                Download
              </Button>
              <Button
                size="small"
                appearance="subtle"
                icon={<Delete20Regular />}
                onClick={() => dispatch({ type: 'REMOVE_ASSET', specId: a.id })}
              >
                Remove
              </Button>
            </>
          )}
        </div>

        {errors[a.id] && (
          <MessageBar intent="error">
            <MessageBarBody>{errors[a.id]}</MessageBarBody>
          </MessageBar>
        )}
      </div>
    );
  }

  return (
    <div className="step-body">
      <Title3 as="h2">Marketplace assets</Title3>
      <Body1>
        Partner Center requires correctly sized images. Upload your own (auto-resized) or
        generate them with AI, then refine with image-to-image. AI image generation needs a
        separate OpenAI-compatible image endpoint (GitHub Models is text-only) — configure it in
        Settings.
      </Body1>

      {!aiReady && (
        <MessageBar intent="info" style={{ marginTop: '12px' }}>
          <MessageBarBody>
            Sign in with GitHub or add a token in Settings to enable AI image generation.
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.groupHead}>
        <Body1Strong>Required assets</Body1Strong>
        <Badge appearance="tint" color="danger" size="small">
          {requiredAssets.length}
        </Badge>
      </div>
      <Caption1 className={styles.groupHint}>
        These images must be supplied before you can publish the offer.
      </Caption1>
      <div className={styles.grid}>{requiredAssets.map(renderCard)}</div>

      {optionalAssets.length > 0 && (
        <>
          <div className={styles.groupHead}>
            <Body1Strong>Optional assets</Body1Strong>
            <Badge appearance="tint" color="informative" size="small">
              {optionalAssets.length}
            </Badge>
          </div>
          <Caption1 className={styles.groupHint}>
            Recommended extras that strengthen your listing but aren't required.
          </Caption1>
          <div className={styles.grid}>{optionalAssets.map(renderCard)}</div>
        </>
      )}
    </div>
  );
}
