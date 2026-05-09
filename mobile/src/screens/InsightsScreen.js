import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GlassCard, MetricCard } from "../components";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { colors, spacing } from "../theme/tokens";

export function InsightsScreen() {
  const { boot } = useAppStore();
  const metrics = boot.insights;
  return (
    <Screen title="Insights" subtitle="Enterprise-grade analytics for scans, devices, geography and conversions.">
      <View style={styles.metrics}>
        <MetricCard value={metrics.totalScans} label="Scans" accent />
        <MetricCard value={metrics.ctaClicks} label="CTA clicks" />
        <MetricCard value={metrics.countries} label="Countries" />
        <MetricCard value={metrics.conversionRate} label="Conversion" accent />
      </View>
      <GlassCard style={styles.chart}><Text style={styles.title}>Scan heatmap</Text><View style={styles.map}>{Array.from({ length: 16 }).map((_, i) => <View key={i} style={[styles.pin, { opacity: 0.25 + (i % 5) * 0.15 }]} />)}</View></GlassCard>
      <GlassCard><Text style={styles.title}>Device analytics</Text>{["Android 72%", "iOS 18%", "Desktop 10%", `Peak hour ${metrics.peakHour}`, `Suspicious scans ${metrics.suspiciousScans}`].map(item => <Text style={styles.row} key={item}>{item}</Text>)}</GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  chart: { marginVertical: spacing.md },
  title: { color: colors.text, fontSize: 19, fontWeight: "900", marginBottom: spacing.md },
  map: { height: 170, borderRadius: 24, backgroundColor: "rgba(34,211,238,0.08)", flexDirection: "row", flexWrap: "wrap", padding: spacing.lg, gap: spacing.md },
  pin: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent },
  row: { color: colors.muted, paddingVertical: 8, fontWeight: "700" }
});
