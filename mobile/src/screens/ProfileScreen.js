import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GlassCard, GradientButton, QRPreview } from "../components";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { colors, spacing } from "../theme/tokens";

export function ProfileScreen() {
  const { boot, actions } = useAppStore();
  const user = boot.user;
  return (
    <Screen title="Profile" subtitle="Your digital identity, QR, NFC and creator page.">
      <GlassCard style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>PM</Text></View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>myqrid.in/u/{user.username}</Text>
        <Text style={styles.meta}>{user.city} • {user.premiumStatus.toUpperCase()} • {user.profileCompletion}% complete</Text>
      </GlassCard>
      <QRPreview value={`https://myqrid.in/u/${user.username}`} gradient />
      <GradientButton title="Open dynamic profile preview" onPress={() => actions.open("dynamicProfile")} style={styles.button} />
      <GradientButton title="Customize QR Studio" onPress={() => actions.open("qrDesigner")} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: "center", marginBottom: spacing.md },
  avatar: { width: 86, height: 86, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.text, fontSize: 28, fontWeight: "900" },
  name: { color: colors.text, fontSize: 24, fontWeight: "900", marginTop: spacing.md },
  username: { color: colors.accent, marginTop: 6, fontWeight: "800" },
  meta: { color: colors.muted, marginTop: 8 },
  button: { marginTop: spacing.md }
});
