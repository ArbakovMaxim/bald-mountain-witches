import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { colors, fonts, radius, rarityColor, spacing } from '../theme';

interface Props {
  /** id → кількість, лише ті, що додані. */
  counts: Record<string, number>;
  total: number;
  onRemove: (id: string) => void;
}

export function Cauldron({ counts, total, onRemove }: Props) {
  const entries = Object.entries(counts).filter(([, c]) => c > 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Казан</Text>
        <Text style={styles.counter}>{plural(total)}</Text>
      </View>

      {entries.length === 0 ? (
        <Text style={styles.empty}>Порожній. Тапни інгредієнт, щоб кинути його у варево.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {entries.map(([id, count]) => {
            const ing = INGREDIENT_BY_ID[id];
            if (!ing) return null;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.chip, { borderColor: rarityColor[ing.rarity] }]}
                onPress={() => onRemove(id)}
                activeOpacity={0.7}
              >
                <Image source={ing.icon} style={styles.chipIcon} resizeMode="cover" />
                <Text style={styles.chipCount}>×{count}</Text>
                <Text style={styles.chipMinus}>−</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

/** Український відмінок для «N інгредієнт/и/ів». */
function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = 'інгредієнтів';
  if (mod10 === 1 && mod100 !== 11) word = 'інгредієнт';
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'інгредієнти';
  return `${n} ${word}`;
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    gap: spacing(3),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.gold,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 1,
  },
  counter: {
    color: colors.parchmentDim,
    fontSize: 13,
  },
  empty: {
    color: colors.muted,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 19,
  },
  chips: {
    gap: spacing(2),
    paddingVertical: spacing(1),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(2.5),
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.bgRaised,
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  chipCount: {
    color: colors.parchment,
    fontFamily: fonts.display,
    fontSize: 15,
  },
  chipMinus: {
    color: colors.ember,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: spacing(0.5),
  },
});
