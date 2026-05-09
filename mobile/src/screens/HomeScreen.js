import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard, GradientButton, MetricCard, PremiumBanner, TagCard } from "../components";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { useProductEngine } from "../hooks/useProductEngine";
import { colors, spacing } from "../theme/tokens";

function TagItem({ tag }) {
  const engine = useProductEngine(tag.type);
  return <TagCard tag={tag} engine={engine} />;
}

export function HomeScreen() {
  const { boot, actions } = useAppStore();
  return (
    <Screen title="Namaste, Preet" subtitle="Your safety, identity, scans and earnings in one premium app.">
      <GlassCard style={styles.hero}>
        <Text style={styles.heroTitle}>India’s smart QR identity ecosystem</Text>
        <Text style={styles.heroText}>Create profiles, activate tags, scan UPI, recover assets and protect family.</Text>
        <View style={styles.heroActions}>
          <GradientButton title="Create QR" onPress={() => actions.open("qrDesigner")} style={styles.action} />
          <GradientButton title="Activate Tag" onPress={() => actions.open("activation")} style={styles.action} />
        </View>
      </GlassCard>

      <View style={styles.metrics}>
        <MetricCard value={boot.insights.totalScans} label="Total scans" accent />
        <MetricCard value={boot.insights.todayScans} label="Today" />
      </View>
      <PremiumBanner />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My smart tags</Text>
        <Pressable onPress={() => actions.open("admin")}><Text style={styles.link}>Admin</Text></Pressable>
      </View>
      {boot.tags.slice(0, 3).map(tag => <TagItem key={tag.id} tag={tag} />)}

      <View style={styles.grid}>
        {[
          ["qr-code-2", "QR Designer", "qrDesigner"],
          ["storefront", "Shop", "shop"],
          ["family-restroom", "Family", "family"],
          ["health-and-safety", "HelpMe", "dynamicProfile"]
        ].map(item => (
          <Pressable key={item[1]} onPress={() => actions.open(item[2])} style={styles.tile}>
            <MaterialIcons name={item[0]} color={colors.accent} size={28} />
            <Text style={styles.tileText}>{item[1]}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: spacing.lg },
  heroTitle: { color: colors.text, fontSize: 24, fontWeight: "900" },
  heroText: { color: colors.muted, marginTop: 8, lineHeight: 21 },
  heroActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  action: { flex: 1 },
  metrics: { flexDirection: "row", gap: spacing.md },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  link: { color: colors.accent, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.md },
  tile: { width: "47%", minHeight: 92, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder, padding: spacing.md, justifyContent: "space-between" },
  tileText: { color: colors.text, fontWeight: "800" }
});
