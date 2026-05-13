import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Btn, StatCard, useToast } from "../../../src/components/ui";
import { C } from "../../../src/constants/theme";
import { useAuthStore } from "../../../src/store/authStore";
import { useRestaurantStore } from "../../../src/store/restaurantStore";
import { fmt, tableTotal, todayLabel } from "../../../src/utils/helpers";

const MENU_ITEMS = [
  { icon: "🧾", title: "Comandas", desc: "Gerenciar mesas", route: "/(private)/comandas", always: true },
  { icon: "📦", title: "Estoque", desc: "Controlar produtos", route: "/(private)/estoque", admin: true },
  { icon: "👨‍🍳", title: "Garçons", desc: "Gerenciar equipe", route: "/(private)/garcons", admin: true },
  { icon: "📊", title: "Relatório", desc: "Fechamentos do dia", route: "/(private)/relatorios", admin: true },
] as const;

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { products, tables, closed, fetchProducts, fetchTables, fetchReports } = useRestaurantStore();
  const { showToast, ToastComponent } = useToast();

  const isAdmin = user?.role === "admin";
  const restaurantId = user?.restaurant_id ?? "";

  useEffect(() => {
    if (!restaurantId) return;
    fetchProducts(restaurantId);
    fetchTables(restaurantId);
    if (isAdmin) fetchReports(restaurantId);
  }, [restaurantId]);

  const openTables = tables.filter((t) => t.status !== "free");
  const revenue = closed.reduce((s, c) => s + c.total, 0);
  const lowStock = products.filter((p) => p.qty < 10).length;

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={{ fontSize: 18 }}>🍽️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.logoName}>Matutus</Text>
          <Text style={styles.logoSub}>Cozinha &amp; Bar</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{isAdmin ? "👑 Gerente" : "🍽️ Garçom"}</Text>
        </View>
        <Btn variant="secondary" sm onPress={handleLogout}>Sair</Btn>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingName}>
            Olá, {user?.name?.split(" ")[0]}! {isAdmin ? "👑" : "🍽️"}
          </Text>
          <Text style={styles.greetingDate} numberOfLines={1}>
            {todayLabel()}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="📦" val={products.length} label="Produtos" />
          <StatCard
            icon="🪑"
            val={openTables.length}
            label="Mesas Abertas"
            color={openTables.length > 0 ? C.success : C.amber}
          />
          {isAdmin && <StatCard icon="💰" val={`R$${Math.round(revenue)}`} label="Faturado" />}
          {isAdmin && (
            <StatCard
              icon="⚠️"
              val={lowStock}
              label="Estoque Baixo"
              color={lowStock > 0 ? C.danger : C.success}
            />
          )}
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Menu Principal</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((m) => {
            const locked = m.admin && !isAdmin;
            return (
              <TouchableOpacity
                key={m.route}
                onPress={locked ? undefined : () => router.push(m.route as any)}
                activeOpacity={locked ? 1 : 0.75}
                style={[styles.menuCard, { opacity: locked ? 0.4 : 1 }]}
              >
                <Text style={styles.menuIcon}>{m.icon}</Text>
                <Text style={[styles.menuTitle, { color: locked ? C.muted : C.cream }]}>
                  {m.title}
                </Text>
                <Text style={styles.menuDesc}>
                  {locked ? "🔒 Somente gerente" : m.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active Tables */}
        {openTables.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Mesas Ativas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tablesScroll}
            >
              {openTables.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => router.push("/(private)/comandas" as any)}
                  style={[
                    styles.tableCard,
                    {
                      borderColor: t.closingRequested
                        ? "rgba(232,160,32,.5)"
                        : "rgba(80,200,120,.3)",
                    },
                  ]}
                >
                  <Text style={styles.tableNum}>Mesa {t.id}</Text>
                  <Text style={{ fontSize: 11, color: t.closingRequested ? C.amber : C.success, marginTop: 2 }}>
                    {t.closingRequested ? "⏳ Fechando" : "🟢 Aberta"}
                  </Text>
                  <Text style={styles.tableTotal}>{fmt(tableTotal(t))}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.amber,
    justifyContent: "center",
    alignItems: "center",
  },
  logoName: { fontSize: 18, color: C.amber, fontWeight: "700" },
  logoSub: { fontSize: 11, color: C.muted },
  roleBadge: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  roleBadgeText: { fontSize: 12, color: C.muted },

  scroll: { flex: 1, padding: 18 },

  greeting: { marginBottom: 22 },
  greetingName: { fontSize: 24, color: C.cream, fontWeight: "800" },
  greetingDate: { fontSize: 13, color: C.muted, marginTop: 2, textTransform: "capitalize" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 26, flexWrap: "wrap" },

  sectionTitle: {
    fontSize: 18,
    color: C.cream,
    fontWeight: "700",
    marginBottom: 14,
  },

  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 26,
  },
  menuCard: {
    width: "47%",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 18,
  },
  menuIcon: { fontSize: 28, marginBottom: 10 },
  menuTitle: { fontSize: 14, fontWeight: "700" },
  menuDesc: { fontSize: 12, color: C.muted, marginTop: 3 },

  tablesScroll: { marginBottom: 24 },
  tableCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    alignItems: "center",
    minWidth: 100,
  },
  tableNum: { fontSize: 18, color: C.amber, fontWeight: "700" },
  tableTotal: { fontSize: 13, fontWeight: "700", color: C.cream, marginTop: 4 },
});
