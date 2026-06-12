import { createLightTheme, type BrandVariants, type Theme } from '@fluentui/react-components';

/**
 * Microsoft-blue brand ramp approximating the Microsoft Learn / Partner Center palette.
 * Primary (80) lands near the classic Microsoft blue (#0078d4 / #0067b8 family).
 */
export const marketplaceBrand: BrandVariants = {
  10: '#020305',
  20: '#111723',
  30: '#16263d',
  40: '#193253',
  50: '#1b3f6a',
  60: '#1b4c82',
  70: '#185a9b',
  80: '#0f6cbd',
  90: '#2d7dc8',
  100: '#4a8ed1',
  110: '#669fda',
  120: '#82b0e3',
  130: '#9ec1eb',
  140: '#bad2f2',
  150: '#d5e3f8',
  160: '#eef4fd'
};

export const marketplaceTheme: Theme = {
  ...createLightTheme(marketplaceBrand),
  fontFamilyBase:
    "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
};

// Microsoft-style accent values reused in custom CSS / inline styles.
export const msColors = {
  blue: '#0067b8',
  blueDark: '#005da6',
  blueHover: '#106ebe',
  ink: '#171717',
  grayText: '#505050',
  border: '#e1dfdd',
  surface: '#ffffff',
  canvas: '#faf9f8'
};
