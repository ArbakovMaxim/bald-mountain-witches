import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';
import type { Mode } from '../data/types';

interface Props {
  players: number;
  onPlayersChange: (n: number) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
}

const PLAYER_OPTIONS = [2, 3, 4, 5];

export function TopControls({ players, onPlayersChange, mode, onModeChange }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <Text style={styles.label}>Відьом за столом</Text>
        <View style={styles.row}>
          {PLAYER_OPTIONS.map((n) => {
            const active = n === players;
            return (
              <TouchableOpacity
                key={n}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => onPlayersChange(n)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Режим варіння</Text>
        <View style={styles.row}>
          <ModeButton
            label="Одиночна варка"
            active={mode === 'solo'}
            onPress={() => onModeChange('solo')}
          />
          <ModeButton
            label="Ковен"
            active={mode === 'coven'}
            onPress={() => onModeChange('coven')}
          />
        </View>
      </View>
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.modeBtn, active && styles.modeBtnActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing(3),
  },
  block: {
    gap: spacing(2),
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    borderColor: colors.gold,
    backgroundColor: colors.bgPanel,
  },
  pillText: {
    color: colors.parchmentDim,
    fontFamily: fonts.display,
    fontSize: 20,
  },
  pillTextActive: {
    color: colors.gold,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing(2.5),
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: colors.gold,
    backgroundColor: colors.bgPanel,
  },
  modeText: {
    color: colors.parchmentDim,
    fontFamily: fonts.display,
    fontSize: 15,
  },
  modeTextActive: {
    color: colors.gold,
  },
});
