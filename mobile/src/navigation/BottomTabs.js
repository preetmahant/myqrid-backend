import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { tabs } from "../constants/routes";
import { colors, radius } from "../theme/tokens";
import { useAppStore } from "../store/AppStore";

export function BottomTabs() {
  const { screen, actions } = useAppStore();
  return (
    <View style={styles.wrap}>
      {tabs.map(tab => {
        const active = screen === tab.key;
        if (tab.center) {
          return (
            <Pressable key={tab.key} onPress={() => actions.navigate(tab.key)} style={styles.centerButtonWrap}>
              <LinearGradient colors={[colors.primary, colors.accent]} style={styles.centerButton}>
                <MaterialIcons name={tab.icon} size={30} color="white" />
              </LinearGradient>
              <Text style={styles.centerLabel}>Quick</Text>
            </Pressable>
          );
        }
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => actions.navigate(tab.key)}>
            <MaterialIcons name={tab.icon} size={24} color={active ? colors.accent : colors.muted} />
            <Text style={[styles.label, active && styles.active]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, bottom: 22, minHeight: 76, borderRadius: radius.xl, backgroundColor: "rgba(16,16,32,0.88)", borderColor: colors.glassBorder, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  tab: { alignItems: "center", width: 58 },
  label: { color: colors.muted, fontSize: 11, marginTop: 4, fontWeight: "700" },
  active: { color: colors.accent },
  centerButtonWrap: { alignItems: "center", transform: [{ translateY: -18 }] },
  centerButton: { width: 66, height: 66, borderRadius: 33, alignItems: "center", justifyContent: "center" },
  centerLabel: { color: colors.text, fontSize: 11, fontWeight: "900", marginTop: 4 }
});
