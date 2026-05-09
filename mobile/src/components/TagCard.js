import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { colors, spacing } from "../theme/tokens";

export function TagCard({ tag, engine }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>{engine?.title || tag.type}</Text>
          <Text style={styles.slug}>/{tag.slug}</Text>
        </View>
        <MaterialIcons name={tag.status === "lost" ? "warning" : "qr-code-2"} color={tag.status === "lost" ? colors.danger : colors.accent} size={30} />
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>{tag.scans} scans</Text>
        <Text style={[styles.pill, tag.status === "active" && styles.active]}>{tag.status}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  title: { color: colors.text, fontWeight: "800", fontSize: 17 },
  slug: { color: colors.muted, marginTop: 4 },
  meta: { color: colors.muted, marginTop: spacing.md },
  pill: { color: colors.warning, textTransform: "uppercase", fontWeight: "800", marginTop: spacing.md },
  active: { color: colors.success }
});
