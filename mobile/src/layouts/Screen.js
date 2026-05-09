import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../theme/tokens";

export function Screen({ title, subtitle, children, right }) {
  return (
    <LinearGradient colors={[colors.background, "#17112A", colors.background]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 118 },
  header: { marginTop: spacing.xl, marginBottom: spacing.lg, flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: colors.muted, marginTop: 8, lineHeight: 20 }
});
