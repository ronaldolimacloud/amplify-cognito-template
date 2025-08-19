import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import { StyleSheet, View } from 'react-native';

type GradientProps = {
  children?: ReactNode;
  // Gradient colors (2+). Provide inline or `as const` per Expo docs
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  // Optional stops matching colors length
  locations?: readonly [number, number, ...number[]];
  // Background behind gradient
  backgroundColor?: string;
  // overlay = top-only overlay (original look), full = full-screen fill
  variant?: 'overlay' | 'full';
  // Height when variant === 'overlay'
  height?: number;
};

export default function Gradient({
  children,
  colors = ['rgba(255,255,255,0.2)', 'transparent'] as const,
  locations,
  backgroundColor = 'black',
  variant = 'overlay',
  height = 400,
}: GradientProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={colors}
        locations={locations}
        style={
          variant === 'full'
            ? StyleSheet.absoluteFillObject
            : [styles.overlay, { height }]
        }
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});
