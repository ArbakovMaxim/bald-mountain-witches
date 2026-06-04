// Типи даних застосунку «Казан».

export type Rarity = 'common' | 'rare' | 'skull';

export type Mode = 'solo' | 'coven';

/** Один інгредієнт із майстер-списку (13 шт.). */
export interface Ingredient {
  id: string;
  name: string;
  rarity: Rarity;
  /** Результат require() для іконки — number у RN, рядок у web. */
  icon: number;
}

/** Запис рецепта з recipes.json. */
export interface Recipe {
  key: string;
  ingredients: string[];
  count: number;
  name: string;
  flavor: string;
  solo: string | null;
  coven: string | null;
  funny: boolean;
  tome: number;
}
