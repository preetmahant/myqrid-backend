import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { GlassCard, GradientButton } from "../components";
import { Screen } from "../layouts/Screen";
import { tagTypeConfig } from "../configs/tagTypeConfig";
import { useAppStore } from "../store/AppStore";
import { colors, radius, spacing } from "../theme/tokens";

export function ActivationScreen() {
  const { actions } = useAppStore();
  const [claimId, setClaimId] = useState("MQ-CLAIM-PET-8821");
  const [tagType, setTagType] = useState("pet");
  const [message, setMessage] = useState("");

  async function activate() {
    const result = await actions.activate({ claimId, tagType });
    setMessage(result.message);
  }

  return (
    <Screen title="Activate Tag" subtitle="Enter admin-issued claim ID to claim a pre-generated QR/NFC tag.">
      <GlassCard>
        <Text style={styles.label}>Claim ID</Text>
        <TextInput value={claimId} onChangeText={setClaimId} style={styles.input} placeholder="MQ-CLAIM-XXXX" placeholderTextColor={colors.muted} autoCapitalize="characters" />
        <Text style={styles.label}>Choose profile type</Text>
        <View style={styles.types}>{Object.keys(tagTypeConfig).map(type => <Text key={type} onPress={() => setTagType(type)} style={[styles.type, tagType === type && styles.active]}>{type}</Text>)}</View>
        <GradientButton title="Claim & Activate" onPress={activate} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: "900", marginBottom: 8 },
  input: { minHeight: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glassBorder, color: colors.text, paddingHorizontal: spacing.md, backgroundColor: colors.surface, marginBottom: spacing.md },
  types: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  type: { color: colors.muted, borderColor: colors.glassBorder, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, textTransform: "capitalize" },
  active: { color: colors.text, backgroundColor: colors.primary },
  message: { color: colors.accent, marginTop: spacing.md, fontWeight: "900" }
});
