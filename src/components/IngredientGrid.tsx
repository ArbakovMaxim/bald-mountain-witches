import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { INGREDIENTS } from '../data/ingredients';
import { colors, fonts, radius, rarityColor, spacing } from '../theme';

interface Props {
  /** id інгредієнта → кількість у казані. */
  counts: Record<string, number>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export function IngredientGrid({ counts, onAdd, onRemove }: Props) {
  return (
    <View style={styles.grid}>
      {INGREDIENTS.map((ing) => {
        const count = counts[ing.id] ?? 0;
        return (
          <TouchableOpacity
            key={ing.id}
            style={styles.cell}
            onPress={() => onAdd(ing.id)}
            onLongPress={() => onRemove(ing.id)}
            delayLongPress={250}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconFrame,
                { borderColor: rarityColor[ing.rarity] },
                count > 0 && styles.iconFrameActive,
              ]}
            >
              <Image source={ing.icon} style={styles.icon} resizeMode="cover" />
            </View>
            {count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={2}>
              {ing.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing(3),
  },
  cell: {
    width: '23%',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  iconFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: colors.bgRaised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconFrameActive: {
    backgroundColor: colors.bgPanel,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 2,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fonts.display,
  },
  name: {
    color: colors.parchmentDim,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
    minHeight: 26,
  },
});
