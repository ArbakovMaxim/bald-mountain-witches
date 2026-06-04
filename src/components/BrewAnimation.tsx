import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { INGREDIENT_BY_ID } from '../data/ingredients';
import type { Mode, Recipe } from '../data/types';
import { ResultCard } from './ResultCard';
import { colors } from '../theme';

// ─── Тайминг сцени (мс) ──────────────────────────────────────────────
const DROP_DURATION = 700; // фаза падіння однієї іконки
const DROP_STAGGER = 70; // затримка між іконками
const BREW_START = 700; // крос-фейд empty→brew
const BREW_DURATION = 900;
const SMOKE_START = 1500; // дим починає рости
const SMOKE_DURATION = 800;
const CARD_START = 2000; // картка проявляється «в димі»
const CARD_DURATION = 450;

const CAULDRON = 240; // розмір спрайту казана
const NECK_RATIO = 0.30; // горло — частка від верху спрайту (точка прицілу падіння)

interface Props {
  /** id → кількість (вибраний набір). */
  counts: Record<string, number>;
  recipe: Recipe | null;
  mode: Mode;
  onReset: () => void;
}

/** Один інгредієнт-снаряд: стартова позиція в кільці навколо казана + фаза. */
interface Projectile {
  id: string;
  icon: number;
  startX: number;
  startY: number;
  rotate: number;
  delay: number;
}

export function BrewAnimation({ counts, recipe, mode, onReset }: Props) {
  const { width, height } = Dimensions.get('window');

  // Центр сцени та точка горла казана.
  const centerX = width / 2;
  const centerY = height / 2;
  const neckY = centerY - CAULDRON / 2 + CAULDRON * NECK_RATIO;

  // Розгортаємо counts у плаский список снарядів (з повторами).
  const projectiles = useMemo<Projectile[]>(() => {
    const ids: string[] = [];
    for (const [id, c] of Object.entries(counts)) {
      for (let i = 0; i < c; i++) ids.push(id);
    }
    const n = ids.length;
    const ringR = Math.min(width, height) * 0.32;
    // Псевдовипадковий, але детермінований кут повороту (без Math.random).
    return ids.map((id, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(n, 1) - Math.PI / 2;
      const jitter = ((i * 37) % 41) - 20; // -20..+20 град
      return {
        id,
        icon: INGREDIENT_BY_ID[id]?.icon ?? 0,
        startX: centerX + Math.cos(angle) * ringR,
        startY: neckY + Math.sin(angle) * ringR * 0.7,
        rotate: jitter,
        delay: i * DROP_STAGGER,
      };
    });
  }, [counts, width, height, centerX, neckY]);

  // ─── Shared values ─────────────────────────────────────────────────
  const brewMix = useSharedValue(0); // 0 = empty, 1 = brew
  const cauldronScale = useSharedValue(1); // bounce при приземленні
  const cauldronSway = useSharedValue(0); // погойдування у фазі варіння
  const brewPulse = useSharedValue(0); // пульс яскравості вариву
  const smokeProgress = useSharedValue(0); // ріст диму 0→1
  const smokeDrift = useSharedValue(0); // горизонтальний дрейф диму
  const cardProgress = useSharedValue(0); // прояв картки

  const lastLanding = projectiles.length
    ? projectiles[projectiles.length - 1].delay + DROP_DURATION
    : BREW_START;

  useEffect(() => {
    // 1. ПАДІННЯ — керується per-projectile стилями нижче (стартують з delay).
    // На «приземленні» останньої іконки робимо bounce казана; кожне приземлення
    // окремо анімувати на UI-потоці складно — даємо акцентний bounce наприкінці падінь.
    cauldronScale.value = withDelay(
      Math.max(lastLanding - 120, 0),
      withSequence(
        withTiming(1.04, { duration: 110, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 160, easing: Easing.inOut(Easing.quad) }),
      ),
    );

    // 2. ВАРІННЯ — крос-фейд empty→brew + погойдування + пульс.
    brewMix.value = withDelay(
      BREW_START,
      withTiming(1, { duration: BREW_DURATION, easing: Easing.inOut(Easing.ease) }),
    );
    cauldronSway.value = withDelay(
      BREW_START,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    brewPulse.value = withDelay(
      BREW_START,
      withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );

    // 3. ДИМ — росте з горла, дрейфує, частково згасає.
    smokeProgress.value = withDelay(
      SMOKE_START,
      withTiming(1, { duration: SMOKE_DURATION, easing: Easing.out(Easing.ease) }),
    );
    smokeDrift.value = withDelay(
      SMOKE_START,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );

    // 4. ПРОЯВ КАРТКИ.
    cardProgress.value = withDelay(
      CARD_START,
      withTiming(1, { duration: CARD_DURATION, easing: Easing.out(Easing.cubic) }),
    );

    return () => {
      cancelAnimation(cauldronScale);
      cancelAnimation(brewMix);
      cancelAnimation(cauldronSway);
      cancelAnimation(brewPulse);
      cancelAnimation(smokeProgress);
      cancelAnimation(smokeDrift);
      cancelAnimation(cardProgress);
    };
  }, []);

  // ─── Анімовані стилі казана ────────────────────────────────────────
  const cauldronWrapStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cauldronScale.value },
      { translateY: cauldronSway.value * 2 },
      { rotate: `${cauldronSway.value * 1.5}deg` },
    ],
  }));

  const emptyStyle = useAnimatedStyle(() => ({ opacity: 1 - brewMix.value }));
  const brewStyle = useAnimatedStyle(() => ({
    opacity: brewMix.value * (0.85 + brewPulse.value * 0.15),
  }));

  // ─── Дим ───────────────────────────────────────────────────────────
  const smokeStyle = useAnimatedStyle(() => {
    const p = smokeProgress.value;
    return {
      opacity: p < 0.5 ? p * 1.8 : 0.9 - (p - 0.5) * 0.8, // 0→0.9→0.5
      transform: [
        { translateX: smokeDrift.value * 14 },
        { translateY: -160 * p },
        { scaleX: 0.6 + 0.8 * p },
        { scaleY: 0.6 + 0.8 * p },
      ],
    };
  });

  // ─── Картка ────────────────────────────────────────────────────────
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardProgress.value,
    transform: [
      { translateY: (1 - cardProgress.value) * 10 },
      { scale: 0.95 + cardProgress.value * 0.05 },
    ],
  }));

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* СЦЕНА: казан, дим, снаряди — за карткою */}
      <View style={styles.scene} pointerEvents="none">
        {/* м'яка тінь-еліпс під казаном */}
        <View
          style={[
            styles.shadow,
            {
              left: centerX - CAULDRON * 0.34,
              top: centerY + CAULDRON / 2 - 14,
              width: CAULDRON * 0.68,
            },
          ]}
        />

        {/* дим виростає з горла (origin унизу по центру) */}
        <Animated.Image
          source={require('../../assets/smoke.png')}
          resizeMode="contain"
          style={[
            styles.smoke,
            {
              left: centerX - CAULDRON * 0.45,
              top: neckY - CAULDRON * 1.1,
              width: CAULDRON * 0.9,
              height: CAULDRON * 1.3,
            },
            smokeStyle,
          ]}
        />

        {/* казан: два накладені кадри */}
        <Animated.View
          style={[
            styles.cauldronWrap,
            { left: centerX - CAULDRON / 2, top: centerY - CAULDRON / 2 },
            cauldronWrapStyle,
          ]}
        >
          <Animated.Image
            source={require('../../assets/cauldron_empty.png')}
            resizeMode="contain"
            style={[styles.cauldronImg, emptyStyle]}
          />
          <Animated.Image
            source={require('../../assets/cauldron_brew.png')}
            resizeMode="contain"
            style={[styles.cauldronImg, styles.cauldronAbs, brewStyle]}
          />
        </Animated.View>

        {/* снаряди-інгредієнти, що падають у горло */}
        {projectiles.map((p, i) => (
          <FallingIcon key={`${p.id}-${i}`} p={p} targetX={centerX} targetY={neckY} />
        ))}
      </View>

      {/* КАРТКА результату — поверх диму, високий контраст */}
      <Animated.View style={[styles.cardLayer, cardStyle]} pointerEvents="auto">
        <ResultCard recipe={recipe} mode={mode} onReset={onReset} transparent />
      </Animated.View>
    </View>
  );
}

/** Окрема іконка, що летить зі свого місця в горло казана. */
function FallingIcon({
  p,
  targetX,
  targetY,
}: {
  p: Projectile;
  targetX: number;
  targetY: number;
}) {
  const t = useSharedValue(0); // 0 = старт, 1 = у горлі

  useEffect(() => {
    t.value = withDelay(
      p.delay,
      withTiming(1, { duration: DROP_DURATION, easing: Easing.in(Easing.quad) }),
    );
    return () => cancelAnimation(t);
  }, []);

  const ICON = 56;
  const style = useAnimatedStyle(() => {
    const v = t.value;
    return {
      opacity: v < 0.9 ? 1 : 1 - (v - 0.9) * 10, // зникає в горлі
      transform: [
        { translateX: p.startX + (targetX - p.startX) * v - ICON / 2 },
        { translateY: p.startY + (targetY - p.startY) * v - ICON / 2 },
        { scale: 1 - 0.6 * v }, // 1 → 0.4
        { rotate: `${p.rotate * v}deg` },
      ],
    };
  });

  return (
    <Animated.Image
      source={p.icon}
      resizeMode="cover"
      style={[styles.proj, { width: ICON, height: ICON }, style]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,5,3,0.92)',
    zIndex: 10,
  },
  scene: {
    ...StyleSheet.absoluteFillObject,
  },
  shadow: {
    position: 'absolute',
    height: 26,
    borderRadius: 999,
    backgroundColor: '#000',
    opacity: 0.45,
    transform: [{ scaleY: 0.4 }],
  },
  cauldronWrap: {
    position: 'absolute',
    width: CAULDRON,
    height: CAULDRON,
  },
  cauldronImg: {
    width: CAULDRON,
    height: CAULDRON,
  },
  cauldronAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  smoke: {
    position: 'absolute',
  },
  proj: {
    position: 'absolute',
    borderRadius: 10,
    top: 0,
    left: 0,
  },
  cardLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
});
