import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard, GradientButton } from "../components";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { colors, radius, spacing } from "../theme/tokens";

const samples = [
  "upi://pay?pa=merchant@upi&pn=myQRID",
  "https://myqrid.in/u/preetmahant",
  "https://myqrid.in/returnme/asset-laptop",
  "https://rzp.io/i/demo"
];

export function ScannerScreen() {
  const { scanResult, actions } = useAppStore();
  const [value, setValue] = useState(samples[0]);
  const result = scanResult?.result;

  return (
    <Screen title="Smart Scanner" subtitle="Detect UPI, myQRID, ReturnMe, NFC-ready and generic QR flows.">
      <View style={styles.scannerFrame}>
        <View style={styles.scanLine} />
        <MaterialIcons name="qr-code-scanner" size={92} color={colors.accent} />
        <Text style={styles.scanText}>Scan wave active</Text>
      </View>

      <TextInput value={value} onChangeText={setValue} placeholder="Paste scanned QR value" placeholderTextColor={colors.muted} style={styles.input} />
      <GradientButton title="Detect QR Action" onPress={() => actions.scan(value)} />

      <View style={styles.samples}>{samples.map(sample => <Pressable key={sample} onPress={() => setValue(sample)}><Text style={styles.sample}>Use sample</Text></Pressable>)}</View>

      {result ? (
        <GlassCard style={styles.result}>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultType}>{result.type}</Text>
          {result.actions.map(action => <GradientButton key={action} title={action} onPress={() => {}} style={styles.resultAction} danger={action === "SOS"} />)}
        </GlassCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scannerFrame: { height: 260, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.accent, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg, overflow: "hidden", backgroundColor: "rgba(34,211,238,0.08)" },
  scanLine: { position: "absolute", top: 74, left: 24, right: 24, height: 2, backgroundColor: colors.accent },
  scanText: { color: colors.text, fontWeight: "900", marginTop: spacing.md },
  input: { minHeight: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glassBorder, color: colors.text, paddingHorizontal: spacing.md, backgroundColor: colors.surface, marginBottom: spacing.md },
  samples: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginVertical: spacing.md },
  sample: { color: colors.accent, fontWeight: "800" },
  result: { marginTop: spacing.md },
  resultTitle: { color: colors.text, fontSize: 22, fontWeight: "900" },
  resultType: { color: colors.muted, marginVertical: spacing.sm, textTransform: "uppercase" },
  resultAction: { marginTop: spacing.sm }
});
