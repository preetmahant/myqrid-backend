import React from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../theme/tokens";
import { useAppStore } from "../store/AppStore";
import { BottomTabs } from "./BottomTabs";
import { HomeScreen } from "../screens/HomeScreen";
import { ScannerScreen } from "../screens/ScannerScreen";
import { QuickActionsScreen } from "../screens/QuickActionsScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ActivationScreen } from "../screens/ActivationScreen";
import { QRDesignerScreen } from "../screens/QRDesignerScreen";
import { AdminPanelScreen } from "../screens/AdminPanelScreen";
import { DynamicProfileScreen } from "../screens/DynamicProfileScreen";
import { ShopScreen } from "../screens/ShopScreen";
import { FamilySafetyScreen } from "../screens/FamilySafetyScreen";

const tabs = { home: HomeScreen, scan: ScannerScreen, quick: QuickActionsScreen, insights: InsightsScreen, profile: ProfileScreen };
const stacks = { activation: ActivationScreen, qrDesigner: QRDesignerScreen, admin: AdminPanelScreen, dynamicProfile: DynamicProfileScreen, shop: ShopScreen, family: FamilySafetyScreen };

export function RootNavigator() {
  const { boot, screen, stack } = useAppStore();
  if (!boot) return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.accent} /></View>;
  const ActiveScreen = stack ? stacks[stack] : tabs[screen] || HomeScreen;
  return <><ActiveScreen /><BottomTabs /></>;
}
