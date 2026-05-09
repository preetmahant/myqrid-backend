import React, { useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { GlassCard, GradientButton } from "../components";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { colors, radius, spacing } from "../theme/tokens";

export function AdminPanelScreen() {
  const { boot, actions } = useAppStore();
  const [count, setCount] = useState("1000");
  const [message, setMessage] = useState("");

  async function generate() {
    const result = await actions.generateTags({ count: Number(count), type: "personal" });
    setMessage(`Generated ${result.created.length} tags. Total inventory ${result.total}.`);
  }

  return (
    <Screen title="Admin Panel" subtitle="Generate claim IDs, manage inventory and control visible app pages.">
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Bulk unique tag generator</Text>
        <Text style={styles.meta}>Creates unique slugs + private claim IDs for activation. Max 1000 in mock flow.</Text>
        <TextInput value={count} onChangeText={setCount} keyboardType="numeric" style={styles.input} />
        <GradientButton title="Generate Unique Slugs + Claim IDs" onPress={generate} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </GlassCard>

      <Text style={styles.section}>Recent claim IDs</Text>
      {boot.tags.slice(-6).reverse().map(tag => <GlassCard key={tag.id} style={styles.row}><View><Text style={styles.tag}>{tag.slug}</Text><Text style={styles.meta}>{tag.claimId}</Text></View><Text style={styles.status}>{tag.status}</Text></GlassCard>)}

      <Text style={styles.section}>App page visibility</Text>
      {Object.entries(boot.moduleVisibility).map(([key, value]) => (
        <GlassCard key={key} style={styles.toggleRow}>
          <Text style={styles.tag}>{key}</Text>
          <Switch value={value} onValueChange={next => actions.setVisibility({ [key]: next })} trackColor={{ true: colors.primary }} thumbColor={colors.accent} />
        </GlassCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 20, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 6 },
  input: { minHeight: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glassBorder, color: colors.text, paddingHorizontal: spacing.md, backgroundColor: colors.surface, marginVertical: spacing.md },
  message: { color: colors.accent, marginTop: spacing.md, fontWeight: "900" },
  section: { color: colors.text, fontWeight: "900", fontSize: 18, marginVertical: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  tag: { color: colors.text, fontWeight: "800", textTransform: "capitalize" },
  status: { color: colors.warning, fontWeight: "800" },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }
});
