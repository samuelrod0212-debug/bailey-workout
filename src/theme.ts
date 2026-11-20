import { Platform, TextStyle } from 'react-native';

// Brand colors, taken from the logo (assets/05-core-workout-logo.pdf).
export const brand = {
  coral: '#F04B3A', // inner C
  cream: '#F0EFE8', // tile
  ink: '#12151F', // outer C and dot
};

export const colors = {
  bg: '#07080A',
  card: '#14161A',
  cardRaised: '#1C1F24',
  stroke: '#23262C',
  text: '#F4F5F7',
  textDim: '#9AA0AA',
  textFaint: '#5D636D',
  accent: brand.coral, // the main accent: Start, today, done, highlighted muscles
  accentInk: brand.ink, // text and icons on top of the accent
  accentSoft: 'rgba(240,75,58,0.15)',
  abs: brand.cream, // abs gets the logo's cream so it reads as its own thing
  absSoft: 'rgba(240,239,232,0.12)',
  streak: '#FFB547',
  weigh: '#8FA8FF',
  missed: '#7C818B', // muted, so missed days don't compete with the coral
  muscleIdle: '#3A3F48',
  muscleBase: '#2A2E35',
};

export const radius = { card: 22, pill: 999, sm: 12 };
export const space = (n: number) => n * 4;

const family = Platform.select({ web: 'Inter, -apple-system, system-ui, sans-serif', default: undefined });

export const type: Record<string, TextStyle> = {
  hero: { fontFamily: family, fontSize: 30, fontWeight: '700', color: colors.text, letterSpacing: -0.6 },
  title: { fontFamily: family, fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  h2: { fontFamily: family, fontSize: 19, fontWeight: '600', color: colors.text, letterSpacing: -0.2 },
  body: { fontFamily: family, fontSize: 16, fontWeight: '400', color: colors.text },
  dim: { fontFamily: family, fontSize: 15, fontWeight: '400', color: colors.textDim },
  label: { fontFamily: family, fontSize: 12, fontWeight: '700', color: colors.textDim, letterSpacing: 1.4, textTransform: 'uppercase' },
  small: { fontFamily: family, fontSize: 13, fontWeight: '500', color: colors.textDim },
  num: { fontFamily: family, fontSize: 22, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
};
export const fontFamily = family;
