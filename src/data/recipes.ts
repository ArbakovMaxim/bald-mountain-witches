import type { Recipe } from './types';
// recipes.json лежить у корені проєкту (~8567 записів). Бандлиться разом із кодом.
import data from '../../recipes.json';

const RECIPES: Recipe[] = (data as { recipes: Recipe[] }).recipes;

/**
 * Індекс key → Recipe для пошуку за O(1).
 * Map будується один раз під час першого імпорту модуля.
 */
const RECIPE_INDEX: Map<string, Recipe> = new Map(
  RECIPES.map((r) => [r.key, r]),
);

/**
 * Будує ключ із набору обраних id інгредієнтів:
 * лексикографічне сортування → склейка через '+'.
 * Повтори інгредієнтів зберігаються (мультимножина).
 */
export function buildKey(ingredientIds: string[]): string {
  return [...ingredientIds].sort().join('+');
}

/**
 * Знаходить рецепт за набором інгредієнтів (з урахуванням повторів).
 * Повертає undefined, якщо комбінації немає в даних.
 */
export function findRecipe(ingredientIds: string[]): Recipe | undefined {
  return RECIPE_INDEX.get(buildKey(ingredientIds));
}

export const RECIPE_COUNT = RECIPES.length;
