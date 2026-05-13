import { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../src/store/authStore";
import { useRestaurantStore } from "../../../src/store/restaurantStore";
import { TopBar, StatCard, Card } from "../../../src/components/ui";
import { C, PAY_LABELS } from "../../../src/constants/theme";
import { fmt } from "../../../src/utils/helpers";

export default function RelatoriosScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { closed, fetchReports } = useRestaurantStore();

  useEffect(() => {
    if (user?.restaurant_id) fetchReports(user.restaurant_id);
  }, []);

  const totalRev = closed.reduce((s, x) => s + x.total, 0);
  const totalItems = closed.reduce((s, x) => s + x.items.reduce((a, i) => a + i.qty, 0), 0);
  const avgTicket = closed.length > 0 ? totalRev / closed.length : 0;

  const payBreak = closed.reduce<Record<string, number>>((acc, cmd) => {
    acc[cmd.pay] = (acc[cmd.pay] ?? 0) + cmd.total;
    return acc;
  }, {});

  return (
    <View style={styles.root}>
      <TopBar title="📊 Relatório do Dia" onBack={() => router.back()} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatCard icon="🧾" val={closed.length} label="Fechamentos" />
          <StatCard icon="💰" val={fmt(totalRev)} label="Faturamento" />
          <StatCard icon="🍺" val={totalItems} label="Itens Vendidos" />
          <StatCard icon="📈" val={fmt(avgTicket)} label="Ticket Médio" />
        </View>

        {/* Payment breakdown */}
        {Object.keys(payBreak).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Por Pagamento</Text>
            {Object.entries(payBreak).map(([k, v]) => (
              <View key={k} style={styles.payRow}>
                <Text style={styles.payLabel}>{PAY_LABELS[k] ?? k}</Text>
                <Text style={styles.payVal}>{fmt(v)}</Text>
              </View>
            ))}
          </>
        )}

        {/* History */}
        <Text style={styles.sectionTitle}>Histórico</Text>
        {closed.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Nenhum fechamento registrado hoje</Text>
          </View>
        ) : (
          [...closed].reverse().map((cmd, i) => (
            <Card key={i} style={styles.billCard}>
              <View style={styles.billAvatar}>
                <Text style={styles.billAvatarText}>{cmd.tid}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.billWaiter}>{cmd.waiter}</Text>
                <Text style={styles.billMeta}>
                  {cmd.open} → {cmd.close} • {PAY_LABELS[cmd.pay] ?? cmd.pay}
                </Text>
                <Text style={styles.billItemCount}>{cmd.items.length} itens</Text>
              </View>
              <Text style={styles.billTotal}>{fmt(cmd.total)}</Text>
            </Card>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, padding: 16 },

  statsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 24 },

  sectionTitle: { fontSize: 18, color: C.cream, fontWeight: "700", marginBottom: 12 },

  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  payLabel: { fontSize: 14, fontWeight: "600", color: C.cream },
  payVal: { fontSize: 15, fontWeight: "800", color: C.amber },

  empty: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: C.muted },

  billCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 8 },
  billAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(232,160,32,.1)",
    borderWidth: 1,
    borderColor: "rgba(232,160,32,.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  billAvatarText: { fontSize: 18, color: C.amber, fontWeight: "900" },
  billWaiter: { fontSize: 14, fontWeight: "700", color: C.cream },
  billMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  billItemCount: { fontSize: 11, color: C.muted },
  billTotal: { fontSize: 16, fontWeight: "800", color: C.amber },
});
