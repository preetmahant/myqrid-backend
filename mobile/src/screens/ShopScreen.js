import React from "react";
import { StyleSheet, Text } from "react-native";
import { GlassCard, GradientButton } from "../components";
import { Screen } from "../layouts/Screen";
import { useAppStore } from "../store/AppStore";
import { colors, spacing } from "../theme/tokens";

export function ShopScreen() {
  const { boot } = useAppStore();
  return (
    <Screen title="Shop & Earn" subtitle="NFC products, smart QR tags, affiliate links, payouts and Razorpay-ready checkout.">
      {boot.products.map(product => <GlassCard key={product.id} style={styles.product}><Text style={styles.title}>{product.title}</Text><Text style={styles.meta}>{product.category} • {product.badge}</Text><Text style={styles.price}>{product.price}</Text><GradientButton title="Add to cart" /></GlassCard>)}
      <GlassCard><Text style={styles.title}>Creator earnings</Text><Text style={styles.meta}>Referral earnings, affiliate dashboard, reward payouts and wallet are ready as data-driven modules.</Text></GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  product: { marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 20, fontWeight: "900" },
  meta: { color: colors.muted, marginVertical: 8 },
  price: { color: colors.accent, fontSize: 24, fontWeight: "900", marginBottom: spacing.md }
});
