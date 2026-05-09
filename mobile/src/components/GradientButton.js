import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "../theme/tokens";

export function GradientButton({ title, onPress, danger = false, style }) {
  return (
    <Pressable onPress={onPress} style={style}>
      <LinearGradient colors={danger ? [colors.danger, "#FB7185"] : [colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  text: { color: "white", fontWeight: "800", fontSize: 16 }
});
