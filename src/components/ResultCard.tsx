import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Mode, Recipe } from '../data/types';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  recipe: Recipe | null; // null → рецепт не знайдено
  mode: Mode;
  onReset: () => void;
  /** true — без затемнюючого фону (картка лежить поверх анімаційної сцени з димом). */
  transparent?: boolean;
}

export function ResultCard({ recipe, mode, onReset, transparent }: Props) {
  return (
    <View style={[styles.overlay, transparent && styles.overlayTransparent]}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {recipe ? <Found recipe={recipe} mode={mode} /> : <NotFound />}
        </ScrollView>

        <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.8}>
          <Text style={styles.resetText}>Нова варка</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Found({ recipe, mode }: { recipe: Recipe; mode: Mode }) {
  const effect = mode === 'solo' ? recipe.solo : recipe.coven;
  const modeLabel = mode === 'solo' ? 'Одиночний' : 'Ковен';

  return (
    <>
      <View style={styles.badgeRow}>
        {recipe.funny && (
          <View style={[styles.tag, styles.tagFunny]}>
            <Text style={styles.tagText}>Легендарний рецепт</Text>
          </View>
        )}
        <View style={styles.tag}>
          <Text style={styles.tagText}>Том {recipe.tome}</Text>
        </View>
      </View>

      <Text style={styles.name}>{recipe.name}</Text>

      <View style={styles.divider} />

      <Text style={styles.flavor}>{recipe.flavor}</Text>

      <View style={styles.effectBlock}>
        <Text style={styles.effectLabel}>{modeLabel}</Text>
        {effect ? (
          <Text style={styles.effect}>{effect}</Text>
        ) : (
          <Text style={styles.effectMissing}>
            Це комбо недоступне в цьому режимі.
          </Text>
        )}
      </View>
    </>
  );
}

function NotFound() {
  return (
    <View style={styles.notFound}>
      <Text style={styles.notFoundTitle}>Рецепт не знайдено</Text>
      <Text style={styles.notFoundText}>
        Така комбінація не значиться в гримуарі. Перевір набір або спробуй інший.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,5,3,0.82)',
    justifyContent: 'center',
    padding: spacing(5),
    zIndex: 10,
  },
  overlayTransparent: {
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    maxHeight: '85%',
    overflow: 'hidden',
    // відрив від диму позаду — текст високого контрасту
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  scroll: {
    padding: spacing(6),
    gap: spacing(3),
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing(2),
    flexWrap: 'wrap',
  },
  tag: {
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2.5),
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
  },
  tagFunny: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201,162,75,0.12)',
  },
  tagText: {
    color: colors.parchmentDim,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.gold,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  flavor: {
    color: colors.parchment,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
  },
  effectBlock: {
    backgroundColor: colors.bgRaised,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    padding: spacing(4),
    gap: spacing(1.5),
    marginTop: spacing(1),
  },
  effectLabel: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  effect: {
    color: colors.parchment,
    fontSize: 16,
    lineHeight: 23,
  },
  effectMissing: {
    color: colors.ember,
    fontStyle: 'italic',
    fontSize: 15,
  },
  notFound: {
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(6),
  },
  notFoundTitle: {
    color: colors.ember,
    fontFamily: fonts.display,
    fontSize: 24,
  },
  notFoundText: {
    color: colors.parchmentDim,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  resetBtn: {
    backgroundColor: colors.gold,
    paddingVertical: spacing(4),
    alignItems: 'center',
  },
  resetText: {
    color: colors.bg,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
