import React from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radius, shadow, spacing } from "../theme/tokens";

export function GlassCard({ children, style, intensity = 26 }) {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadow.card
  }
});
