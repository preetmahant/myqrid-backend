import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { colors, spacing } from "../theme/tokens";

const actions = [
  ["qr-code-2", "Create Custom QR", "qrDesigner"],
  ["verified-user", "Activate Claim ID", "activation"],
  ["payments", "Scan & Pay"],
  ["local-phone", "WhatsApp Share"],
  ["report", "Mark Lost"],
  ["sos", "SOS Mode", "family"],
  ["storefront", "Shop/Earn", "shop"],
  ["admin-panel-settings", "Admin Panel", "admin"]
];

export function QuickActionsScreen() {
  const { actions: nav } = useAppStore();
  return (
    <Screen title="Quick Actions" subtitle="Daily utility hub for UPI, QR, safety, sharing and earning.">
      <View style={styles.grid}>{actions.map(item => (
        <Pressable key={item[1]} style={styles.tile} onPress={() => item[2] && nav.open(item[2])}>
          <MaterialIcons name={item[0]} size={32} color={item[0] === "sos" ? colors.danger : colors.accent} />
          <Text style={styles.text}>{item[1]}</Text>
        </Pressable>
      ))}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: { width: "47%", minHeight: 118, backgroundColor: colors.surface, borderColor: colors.glassBorder, borderWidth: 1, borderRadius: 28, padding: spacing.md, justifyContent: "space-between" },
  text: { color: colors.text, fontSize: 16, fontWeight: "900" }
});
