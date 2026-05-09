import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmergencyBanner, GlassCard, GradientButton } from "../components";
import { Screen } from "../layouts/Screen";
import { colors, spacing } from "../theme/tokens";

export function FamilySafetyScreen() {
  return (
    <Screen title="HelpMe Family" subtitle="Safety circle, emergency visibility, child and elderly monitoring ready UI.">
      <EmergencyBanner text="Emergency SOS will alert your safety circle with live location." />
      {["Maa", "Papa", "Child", "Elderly care"].map((name, index) => <GlassCard key={name} style={styles.member}><View><Text style={styles.name}>{name}</Text><Text style={styles.meta}>{index === 2 ? "Geofence enabled" : "Emergency contact active"}</Text></View><Text style={styles.safe}>Safe</Text></GlassCard>)}
      <GradientButton title="Send SOS Test" danger />
    </Screen>
  );
}

const styles = StyleSheet.create({
  member: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  name: { color: colors.text, fontWeight: "900", fontSize: 18 },
  meta: { color: colors.muted, marginTop: 4 },
  safe: { color: colors.success, fontWeight: "900" }
});
