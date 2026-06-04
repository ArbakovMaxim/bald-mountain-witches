import type { Ingredient } from './types';

/**
 * Майстер-список з 13 інгредієнтів. Порядок визначає розкладку сітки:
 * спершу common (⚪), потім rare (🟡), останній — skull (🔴).
 *
 * Іконки бандляться статично через require() — шлях має бути літералом.
 */
export const INGREDIENTS: Ingredient[] = [
  // common ⚪
  { id: 'son_trava', name: 'Сон-трава', rarity: 'common', icon: require('../../assets/ingredients/son_trava.png') },
  { id: 'kozyache_vymya', name: "Козяче вим'я", rarity: 'common', icon: require('../../assets/ingredients/kozyache_vymya.png') },
  { id: 'temnyi_hryb', name: 'Темний гриб', rarity: 'common', icon: require('../../assets/ingredients/temnyi_hryb.png') },
  { id: 'popil_mertsia', name: 'Попіл мерця', rarity: 'common', icon: require('../../assets/ingredients/popil_mertsia.png') },
  { id: 'zhabiacha_lapka', name: "Жаб'яча лапка", rarity: 'common', icon: require('../../assets/ingredients/zhabiacha_lapka.png') },
  { id: 'pero_vorona', name: 'Перо чорного ворона', rarity: 'common', icon: require('../../assets/ingredients/pero_vorona.png') },
  // rare 🟡
  { id: 'tsviakh_truny', name: 'Цвях труни', rarity: 'rare', icon: require('../../assets/ingredients/tsviakh_truny.png') },
  { id: 'klyk_myshi', name: 'Клик летючої миші', rarity: 'rare', icon: require('../../assets/ingredients/klyk_myshi.png') },
  { id: 'chornyi_korin', name: 'Чорний корінь', rarity: 'rare', icon: require('../../assets/ingredients/chornyi_korin.png') },
  { id: 'smola_duba', name: 'Смола прадавнього дуба', rarity: 'rare', icon: require('../../assets/ingredients/smola_duba.png') },
  { id: 'pavuche_oko', name: 'Павуче око', rarity: 'rare', icon: require('../../assets/ingredients/pavuche_oko.png') },
  { id: 'oko_sycha', name: 'Око сича', rarity: 'rare', icon: require('../../assets/ingredients/oko_sycha.png') },
  // skull 🔴
  { id: 'cherep', name: 'Маленький череп істоти', rarity: 'skull', icon: require('../../assets/ingredients/cherep.png') },
];

/** Швидкий доступ id → Ingredient. */
export const INGREDIENT_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);
