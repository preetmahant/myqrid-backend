import React from "react";
import { Text, StyleSheet } from "react-native";
import { GlassCard } from "./GlassCard";
import { colors } from "../theme/tokens";

export function EmergencyBanner({ text = "SOS ready • Family will be alerted instantly" }) {
  return <GlassCard style={[styles.banner, { borderColor: colors.danger }]}><Text style={styles.danger}>{text}</Text></GlassCard>;
}

export function PremiumBanner() {
  return <GlassCard style={styles.banner}><Text style={styles.title}>₹99 Premium unlocks HD QR, unlimited links, hidden sections and advanced analytics.</Text></GlassCard>;
}

export function RewardBanner({ amount = "₹500" }) {
  return <GlassCard style={styles.banner}><Text style={styles.title}>Reward mode active • Finder can claim {amount}</Text></GlassCard>;
}

const styles = StyleSheet.create({
  banner: { marginVertical: 10 },
  title: { color: colors.text, fontWeight: "800" },
  danger: { color: colors.danger, fontWeight: "900" }
});
