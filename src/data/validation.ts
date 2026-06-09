import type { Mode } from './types';

export interface Validation {
  ok: boolean;
  /** Підказка українською, чому не можна зварити (порожня, якщо ok). */
  hint: string;
}

/**
 * Максимум інгредієнтів для режиму:
 *  - Solo:  3
 *  - Coven: players (кожна відьма кидає рівно 1 інгредієнт)
 */
export function maxIngredients(mode: Mode, players: number): number {
  return mode === 'solo' ? 3 : players;
}

/**
 * Правила кількості інгредієнтів:
 *  - Solo:  1 ≤ N ≤ 3
 *  - Coven: 2 ≤ N ≤ players  (кожна відьма кидає рівно 1 інгредієнт)
 */
export function validate(total: number, mode: Mode, players: number): Validation {
  if (total === 0) {
    return { ok: false, hint: 'Додай інгредієнти в казан.' };
  }

  if (mode === 'solo') {
    if (total < 1) return { ok: false, hint: 'Для одиночної варки потрібен хоча б 1 інгредієнт.' };
    if (total > 3) return { ok: false, hint: 'Одиночна варка: не більше 3 інгредієнтів.' };
    return { ok: true, hint: '' };
  }

  // coven
  if (total < 2) {
    return { ok: false, hint: 'Ковен: щонайменше 2 інгредієнти.' };
  }
  if (total > players) {
    return {
      ok: false,
      hint: `Ковен: не більше ${players} інгредієнтів (за числом відьом).`,
    };
  }
  return { ok: true, hint: '' };
}
