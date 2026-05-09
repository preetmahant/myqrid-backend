import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { GlassCard, GradientButton, QRPreview } from "../components";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { colors, radius, spacing } from "../theme/tokens";

const stylesList = ["Gradient", "Rounded", "Frame", "Brand", "Sticker"];

export function QRDesignerScreen() {
  const { boot, actions } = useAppStore();
  const [value, setValue] = useState(`https://myqrid.in/u/${boot.user.username}`);
  const [selected, setSelected] = useState("Gradient");
  const [saved, setSaved] = useState(false);

  async function save() {
    await actions.designQr({ value, style: selected, centerLogo: true, colors: [colors.primary, colors.accent] });
    setSaved(true);
  }

  return (
    <Screen title="QR Designer" subtitle="Create custom QR with center logo, gradient, frame and print-ready exports.">
      <QRPreview value={value} gradient={selected === "Gradient"} />
      <TextInput value={value} onChangeText={setValue} style={styles.input} placeholderTextColor={colors.muted} />
      <View style={styles.options}>{stylesList.map(item => <Text key={item} onPress={() => setSelected(item)} style={[styles.option, selected === item && styles.active]}>{item}</Text>)}</View>
      <GlassCard><Text style={styles.title}>Export formats</Text><Text style={styles.meta}>PNG • SVG • PDF • Sticker • Print ready</Text></GlassCard>
      <GradientButton title="Save QR Design" onPress={save} style={styles.button} />
      {saved ? <Text style={styles.saved}>QR design saved to mock state.</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glassBorder, color: colors.text, paddingHorizontal: spacing.md, backgroundColor: colors.surface, marginVertical: spacing.md },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  option: { color: colors.muted, borderColor: colors.glassBorder, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  active: { color: colors.text, backgroundColor: colors.primary },
  title: { color: colors.text, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 8 },
  button: { marginTop: spacing.md },
  saved: { color: colors.accent, fontWeight: "900", marginTop: spacing.md }
});
