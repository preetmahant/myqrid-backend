import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { GlassCard } from "./GlassCard";
import { colors, radius, spacing } from "../theme/tokens";

export function QRPreview({ value, logoUri, gradient = false }) {
  return (
    <GlassCard style={styles.wrap}>
      <View style={[styles.qrBox, gradient && styles.gradientHint]}>
        <QRCode value={value || "https://myqrid.in"} size={180} color="#111827" backgroundColor="#FFFFFF" />
        {logoUri ? <Image source={{ uri: logoUri }} style={styles.logo} /> : <View style={styles.logoFallback}><Text style={styles.logoText}>mQ</Text></View>}
      </View>
      <Text style={styles.caption}>Center logo QR • PNG/SVG/PDF ready</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  qrBox: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  gradientHint: { borderWidth: 4, borderColor: colors.accent },
  logo: { position: "absolute", width: 44, height: 44, borderRadius: 12 },
  logoFallback: { position: "absolute", width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  logoText: { color: "white", fontWeight: "900" },
  caption: { color: colors.muted, marginTop: spacing.md }
});
