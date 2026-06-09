// reanimated має ініціалізуватися першим (для web/Expo).
import 'react-native-reanimated';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { TopControls } from './src/components/TopControls';
import { IngredientGrid } from './src/components/IngredientGrid';
import { Cauldron } from './src/components/Cauldron';
import { ResultCard } from './src/components/ResultCard';
import { BrewAnimation } from './src/components/BrewAnimation';
import { findRecipe } from './src/data/recipes';
import { validate, maxIngredients } from './src/data/validation';
import type { Mode, Recipe } from './src/data/types';
import { colors, fonts, radius, spacing } from './src/theme';

export default function App() {
  const [players, setPlayers] = useState(3);
  const [mode, setMode] = useState<Mode>('solo');
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Результат варіння: undefined — нічого; null — не знайдено; Recipe — знайдено.
  const [result, setResult] = useState<undefined | null | Recipe>(undefined);

  // Фаза показу результату:
  //  'idle'      — варіння не запущено;
  //  'animating' — грає косметична анімація (BrewAnimation сам покаже картку наприкінці);
  //  'card'      — картка показана одразу (reduce-motion).
  const [phase, setPhase] = useState<'idle' | 'animating' | 'card'>('idle');

  // Доступність: «Зменшити рух».
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (v) => setReduceMotion(v),
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const total = useMemo(
    () => Object.values(counts).reduce((s, c) => s + c, 0),
    [counts],
  );

  const validation = useMemo(
    () => validate(total, mode, players),
    [total, mode, players],
  );

  const addIngredient = (id: string) =>
    setCounts((prev) => {
      // Не даємо перевищити максимум для поточного режиму.
      const used = Object.values(prev).reduce((s, c) => s + c, 0);
      if (used >= maxIngredients(mode, players)) return prev;
      return { ...prev, [id]: (prev[id] ?? 0) + 1 };
    });

  const removeIngredient = (id: string) =>
    setCounts((prev) => {
      const next = { ...prev };
      const c = (next[id] ?? 0) - 1;
      if (c <= 0) delete next[id];
      else next[id] = c;
      return next;
    });

  const clearCauldron = () => setCounts({});

  /** Підрізає набір під заданий максимум (прибирає зайве, зберігаючи решту). */
  const trimToMax = (prev: Record<string, number>, max: number) => {
    let used = Object.values(prev).reduce((s, c) => s + c, 0);
    if (used <= max) return prev;
    const next = { ...prev };
    // прибираємо по одному, поки не вкладемось у ліміт
    const ids = Object.keys(next);
    let i = ids.length - 1;
    while (used > max && i >= 0) {
      const id = ids[i];
      if (next[id] > 0) {
        next[id] -= 1;
        used -= 1;
        if (next[id] === 0) delete next[id];
      } else {
        i -= 1;
      }
    }
    return next;
  };

  // Зміна режиму/числа гравців може зменшити ліміт — підрізаємо набір.
  const changeMode = (m: Mode) => {
    setMode(m);
    setCounts((prev) => trimToMax(prev, maxIngredients(m, players)));
  };

  const changePlayers = (n: number) => {
    setPlayers(n);
    setCounts((prev) => trimToMax(prev, maxIngredients(mode, n)));
  };

  const brew = () => {
    if (!validation.ok || phase !== 'idle') return; // кнопка блокується на час анімації
    const ids: string[] = [];
    for (const [id, c] of Object.entries(counts)) {
      for (let i = 0; i < c; i++) ids.push(id);
    }
    const recipe = findRecipe(ids);
    setResult(recipe ?? null);
    // Результат уже відомий; анімація лише ефектно його розкриває.
    setPhase(reduceMotion ? 'card' : 'animating');
  };

  const newBrew = () => {
    setResult(undefined);
    setPhase('idle');
    clearCauldron();
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>Казан</Text>
            <Text style={styles.appSub}>Бал на Лисій горі</Text>
          </View>

          <TopControls
            players={players}
            onPlayersChange={changePlayers}
            mode={mode}
            onModeChange={changeMode}
          />

          <Cauldron counts={counts} total={total} onRemove={removeIngredient} />

          <IngredientGrid
            counts={counts}
            onAdd={addIngredient}
            onRemove={removeIngredient}
            atMax={total >= maxIngredients(mode, players)}
          />
        </ScrollView>

        <View style={styles.footer}>
          {!validation.ok && total > 0 && (
            <Text style={styles.hint}>{validation.hint}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.brewBtn,
              (!validation.ok || phase !== 'idle') && styles.brewBtnDisabled,
            ]}
            disabled={!validation.ok || phase !== 'idle'}
            onPress={brew}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.brewText,
                (!validation.ok || phase !== 'idle') && styles.brewTextDisabled,
              ]}
            >
              Зварити
            </Text>
          </TouchableOpacity>
        </View>

        {/* Косметична анімація розкриття (сама показує картку наприкінці). */}
        {phase === 'animating' && (
          <BrewAnimation
            counts={counts}
            recipe={result ?? null}
            mode={mode}
            onReset={newBrew}
          />
        )}

        {/* Reduce-motion: картка одразу, без анімації. */}
        {phase === 'card' && result !== undefined && (
          <ResultCard recipe={result} mode={mode} onReset={newBrew} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing(5),
    gap: spacing(5),
    paddingBottom: spacing(6),
  },
  titleRow: {
    alignItems: 'center',
    gap: spacing(1),
  },
  appTitle: {
    color: colors.gold,
    fontFamily: fonts.display,
    fontSize: 38,
    letterSpacing: 4,
  },
  appSub: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footer: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(3),
    paddingBottom: spacing(4),
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bgPanel,
    gap: spacing(2),
  },
  hint: {
    color: colors.parchmentDim,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  brewBtn: {
    backgroundColor: colors.gold,
    paddingVertical: spacing(4),
    borderRadius: radius.md,
    alignItems: 'center',
  },
  brewBtnDisabled: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brewText: {
    color: colors.bg,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  brewTextDisabled: {
    color: colors.muted,
  },
});
