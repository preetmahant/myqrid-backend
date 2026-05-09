import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EmergencyBanner, GlassCard, GradientButton, RewardBanner } from "../components";
import { Screen } from "../layouts/Screen";
import { tagTypeConfig } from "../configs/tagTypeConfig";
import { useProductEngine } from "../hooks/useProductEngine";
import { useAppStore } from "../store/AppStore";
import { colors, spacing } from "../theme/tokens";

export function DynamicProfileScreen() {
  const { boot } = useAppStore();
  const [tagType, setTagType] = useState("pet");
  const engine = useProductEngine(tagType, boot.user);

  return (
    <Screen title="Dynamic Profile" subtitle="Fields, CTAs and modules change automatically by tag type.">
      <View style={styles.types}>{Object.keys(tagTypeConfig).map(type => <Text key={type} onPress={() => setTagType(type)} style={[styles.type, tagType === type && styles.active]}>{type}</Text>)}</View>
      {tagType === "medical" ? <EmergencyBanner /> : null}
      {tagType === "asset" || tagType === "pet" ? <RewardBanner /> : null}
      <GlassCard style={styles.hero}>
        <Text style={styles.title}>{engine.title}</Text>
        <Text style={styles.meta}>Engine: {engine.engine} • Scan: {engine.scanBehavior}</Text>
      </GlassCard>
      <Text style={styles.section}>Visible modules</Text>
      {engine.visibleModules.map(module => (
        <GlassCard key={module.key} style={styles.module}>
          <MaterialIcons name={module.icon} size={24} color={colors.accent} />
          <View style={styles.moduleText}><Text style={styles.moduleTitle}>{module.label}</Text><Text style={styles.meta}>{module.premium ? "Premium module" : "Free module"}</Text></View>
        </GlassCard>
      ))}
      <Text style={styles.section}>Smart CTAs</Text>
      {engine.ctas.map(cta => <GradientButton key={cta} title={cta} danger={cta === "SOS"} style={styles.cta} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  types: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  type: { color: colors.muted, borderColor: colors.glassBorder, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, textTransform: "capitalize" },
  active: { color: colors.text, backgroundColor: colors.primary },
  hero: { marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 5 },
  section: { color: colors.text, fontWeight: "900", fontSize: 18, marginVertical: spacing.md },
  module: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  moduleText: { flex: 1 },
  moduleTitle: { color: colors.text, fontWeight: "800" },
  cta: { marginBottom: spacing.sm }
});
