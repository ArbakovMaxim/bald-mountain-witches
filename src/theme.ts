import type { Rarity } from './data/types';

/**
 * Темна атмосферна тема: копоть, пергамент, золото.
 * Folk-horror / гримуар.
 */
export const colors = {
  // фони
  bg: '#16110d', // глибока копоть
  bgPanel: '#211913', // панель/казан
  bgRaised: '#2c2118', // підняті елементи, плитки
  bgInput: '#1b140f',

  // текст
  parchment: '#e8dcc0', // основний «пергаментний» текст
  parchmentDim: '#b9a988', // приглушений
  muted: '#8a7a62', // підписи, неактивне

  // акценти
  gold: '#c9a24b', // золото — головний акцент
  goldDim: '#8a6f33',
  ember: '#a8431f', // тлінь/вогонь — застереження, skull

  // рамки
  border: '#3a2d20',
  borderSoft: '#2a2018',

  // рідкість (колір рамки іконки)
  rarityCommon: '#7d7468', // ⚪ сірий
  rarityRare: '#c9a24b', // 🟡 золотий
  raritySkull: '#a8431f', // 🔴 червоний
} as const;

export const rarityColor: Record<Rarity, string> = {
  common: colors.rarityCommon,
  rare: colors.rarityRare,
  skull: colors.raritySkull,
};

export const fonts = {
  // Системна serif дає «книжкову/гримуарну» подачу без бандлу шрифтів.
  display: 'serif',
  body: undefined as string | undefined, // системний sans для читабельності тіла
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
};

export const spacing = (n: number) => n * 4;
