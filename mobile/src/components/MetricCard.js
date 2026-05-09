import React from "react";
import { Text, StyleSheet } from "react-native";
import { GlassCard } from "./GlassCard";
import { colors } from "../theme/tokens";

export function MetricCard({ label, value, accent }) {
  return (
    <GlassCard style={styles.card}>
      <Text style={[styles.value, accent && { color: colors.accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 145 },
  value: { color: colors.text, fontSize: 24, fontWeight: "900" },
  label: { color: colors.muted, marginTop: 6, fontSize: 12 }
});
