import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TopBar, useToast } from "../../../src/components/ui";
import { C } from "../../../src/constants/theme";
import { useAuthStore } from "../../../src/store/authStore";
import { useRestaurantStore } from "../../../src/store/restaurantStore";
import type { TableStatus } from "../../../src/types";
import { fmt, tableTotal } from "../../../src/utils/helpers";

const STATUS_CONFIG: Record<TableStatus, { label: string; dot: string; border: string }> = {
  free: { label: "Livre", dot: C.muted, border: C.border },
  occupied: { label: "Ocupada", dot: C.success, border: "rgba(80,200,120,.35)" },
  closing: { label: "Fechando", dot: C.amber, border: "rgba(232,160,32,.5)" },
};

export default function ComandasScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tables, fetchTables, openTable } = useRestaurantStore();
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (user?.restaurant_id) fetchTables(user.restaurant_id);
  }, []);

  async function handleTablePress(tableId: number) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    if (table.status === "free") {
      try {
        await openTable(tableId, user?.name ?? "Garçom");
      } catch {
        showToast("Erro ao abrir mesa");
        return;
      }
    }

    router.push(`/(private)/comandas/${tableId}` as any);
  }

  return (
    <View style={styles.root}>
      <TopBar title="🧾 Comandas" onBack={() => router.back()} />
      <Text style={styles.hint}>Toque em uma mesa para abri-la ou gerenciá-la</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {tables.map((t) => {
          const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.free;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => handleTablePress(t.id)}
              activeOpacity={0.75}
              style={[styles.tableCard, { borderColor: cfg.border }]}
            >
              {t.closingRequested && <View style={styles.blinkDot} />}

              <Text style={styles.tableNum}>{t.id}</Text>
              <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
              <Text style={[styles.statusLabel, { color: cfg.dot }]}>{cfg.label}</Text>

              {t.status !== "free" && (
                <>
                  <Text style={styles.tableTotal}>{fmt(tableTotal(t))}</Text>
                  <Text style={styles.tableItems}>{t.items.length} itens</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  hint: {
    textAlign: "center",
    color: C.muted,
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  tableCard: {
    width: "30%",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    minHeight: 100,
    position: "relative",
  },
  blinkDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.amber,
  },
  tableNum: {
    fontSize: 28,
    color: C.amber,
    fontWeight: "700",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginVertical: 4,
  },
  statusLabel: { fontSize: 11, fontWeight: "600" },
  tableTotal: { fontSize: 12, fontWeight: "700", color: C.cream, marginTop: 3 },
  tableItems: { fontSize: 10, color: C.muted },
});
