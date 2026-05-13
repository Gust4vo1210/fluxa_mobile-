import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BottomModal, Btn, Card, TopBar, useToast } from "../../../src/components/ui";
import { C, CAT_ICONS } from "../../../src/constants/theme";
import { useAuthStore } from "../../../src/store/authStore";
import { useRestaurantStore } from "../../../src/store/restaurantStore";
import type { PaymentMethod } from "../../../src/types";
import { fmt, tableTotal } from "../../../src/utils/helpers";

export default function ComandaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tableId = parseInt(id ?? "0");
  const router = useRouter();
  const { user } = useAuthStore();
  const { tables, products, addItem, removeItem, requestClose, cancelClose, closeTable } =
    useRestaurantStore();
  const { showToast, ToastComponent } = useToast();

  const isAdmin = user?.role === "admin";
  const tbl = tables.find((t) => t.id === tableId);

  const [selPid, setSelPid] = useState<number>(products[0]?.id ?? 0);
  const [qty, setQty] = useState(1);
  const [closeModal, setCloseModal] = useState(false);
  const [prodModal, setProdModal] = useState(false);
  const [pay, setPay] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  if (!tbl) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: C.muted }}>Mesa não encontrada</Text>
      </View>
    );
  }

  const tot = tableTotal(tbl);
  const selProd = products.find((p) => p.id === selPid);

  async function handleAddItem() {
    const p = products.find((p) => p.id === selPid);
    if (!p) return;
    if (p.qty < qty) { showToast("Estoque insuficiente!"); return; }
    setLoading(true);
    try {
      await addItem(tableId, {
        pid: p.id,
        name: p.name,
        price: p.price,
        qty,
        icon: p.icon || CAT_ICONS[p.cat],
      });
      showToast("Item adicionado ✓");
      setQty(1);
    } catch {
      showToast("Erro ao adicionar item");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveItem(idx: number) {
    try {
      await removeItem(tableId, idx);
      showToast("Item removido");
    } catch {
      showToast("Erro ao remover item");
    }
  }

  async function handleCloseRequest() {
    if (!isAdmin) {
      try {
        await requestClose(tableId);
        showToast("Solicitação enviada ao gerente!");
        router.back();
      } catch {
        showToast("Erro ao solicitar fechamento");
      }
      return;
    }
    setPay(null);
    setCloseModal(true);
  }

  async function handleCancelClose() {
    try {
      await cancelClose(tableId);
      showToast("Cancelado");
    } catch {
      showToast("Erro ao cancelar");
    }
  }

  async function handleConfirmClose() {
    if (!pay) { showToast("Selecione o pagamento!"); return; }
    setLoading(true);
    try {
      await closeTable(tableId, pay);
      setCloseModal(false);
      showToast("Comanda fechada! ✓");
      router.back();
    } catch {
      showToast("Erro ao fechar comanda");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <TopBar
        title={`Mesa ${tableId}`}
        onBack={() => router.back()}
        action={
          <Btn
            sm
            variant={isAdmin ? "primary" : "success"}
            onPress={handleCloseRequest}
          >
            {isAdmin ? "Fechar" : "Solicitar Fechamento"}
          </Btn>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Admin sees closing request banner */}
        {isAdmin && tbl.closingRequested && (
          <View style={styles.closingBanner}>
            <Text style={styles.closingBannerText}>⏳ Garçom solicitou fechamento</Text>
            <View style={styles.closingBannerBtns}>
              <Btn variant="success" sm onPress={() => { setPay(null); setCloseModal(true); }} style={{ flex: 1 }}>
                ✓ Confirmar
              </Btn>
              <Btn variant="danger" sm onPress={handleCancelClose} style={{ flex: 1 }}>
                ✕ Cancelar
              </Btn>
            </View>
          </View>
        )}

        {/* Table info */}
        <Card style={styles.infoCard}>
          {[
            ["Garçom", tbl.waiter ?? "—"],
            ["Abertura", tbl.openTime ?? "—"],
            ["Status", tbl.closingRequested ? "⏳ Solicitando fechamento" : "🟢 Aberta"],
          ].map(([l, v]) => (
            <View key={l} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{l}</Text>
              <Text style={styles.infoVal}>{v}</Text>
            </View>
          ))}
        </Card>

        {/* Add item */}
        <Text style={styles.sectionTitle}>Adicionar Item</Text>
        <TouchableOpacity
          onPress={() => setProdModal(true)}
          style={styles.prodSelector}
        >
          <Text style={{ color: C.cream, fontSize: 14 }}>
            {selProd ? `${selProd.icon} ${selProd.name} — R$ ${selProd.price.toFixed(2)}` : "Selecionar produto"}
          </Text>
          <Text style={{ color: C.muted }}>▾</Text>
        </TouchableOpacity>

        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            value={String(qty)}
            onChangeText={(v) => setQty(parseInt(v) || 1)}
            keyboardType="numeric"
            style={styles.qtyInput}
          />
          <TouchableOpacity onPress={() => setQty((q) => q + 1)} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <Btn onPress={handleAddItem} loading={loading} style={styles.addBtn}>
            Adicionar
          </Btn>
        </View>

        {/* Items list */}
        <Text style={styles.sectionTitle}>Itens Pedidos ({tbl.items.length})</Text>
        {tbl.items.length === 0 ? (
          <Text style={styles.empty}>🧾 Nenhum item ainda</Text>
        ) : (
          tbl.items.map((item, i) => (
            <Card key={i} style={styles.itemCard}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>x{item.qty} • R$ {item.price.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemTotal}>{fmt(item.price * item.qty)}</Text>
              <TouchableOpacity onPress={() => handleRemoveItem(i)} style={styles.delBtn}>
                <Text style={{ fontSize: 14 }}>🗑</Text>
              </TouchableOpacity>
            </Card>
          ))
        )}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total da Mesa</Text>
          <Text style={styles.totalVal}>{fmt(tot)}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Product picker modal */}
      <BottomModal open={prodModal} onClose={() => setProdModal(false)} title="Selecionar Produto">
        {products.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => { setSelPid(p.id); setProdModal(false); }}
            style={[
              styles.prodItem,
              {
                borderColor: selPid === p.id ? C.amber : C.border,
                backgroundColor: selPid === p.id ? "rgba(232,160,32,.1)" : C.surface2,
              },
            ]}
          >
            <Text style={{ fontSize: 22 }}>{p.icon || CAT_ICONS[p.cat]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{p.name}</Text>
              <Text style={styles.itemMeta}>Estoque: {p.qty} {p.unit}</Text>
            </View>
            <Text style={styles.itemTotal}>R$ {p.price.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
        <Btn variant="secondary" onPress={() => setProdModal(false)} style={styles.fullWidth}>
          Cancelar
        </Btn>
      </BottomModal>

      {/* Close table modal */}
      <BottomModal
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title="Fechar Comanda"
        subtitle={`Mesa ${tableId} • Total: ${fmt(tot)}`}
      >
        <Text style={styles.payTitle}>Forma de Pagamento</Text>
        <View style={styles.payGrid}>
          {(
            [
              ["pix", "📱", "PIX"],
              ["credito", "💳", "Crédito"],
              ["debito", "💳", "Débito"],
              ["dinheiro", "💵", "Dinheiro"],
            ] as [PaymentMethod, string, string][]
          ).map(([k, ic, lb]) => (
            <TouchableOpacity
              key={k}
              onPress={() => setPay(k)}
              style={[
                styles.payOption,
                {
                  borderColor: pay === k ? C.amber : C.border,
                  backgroundColor: pay === k ? "rgba(232,160,32,.12)" : C.surface2,
                },
              ]}
            >
              <Text style={{ fontSize: 24, marginBottom: 5 }}>{ic}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: pay === k ? C.amber : C.cream }}>
                {lb}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.closeBtns}>
          <Btn variant="secondary" onPress={() => setCloseModal(false)} style={{ flex: 1 }}>
            Cancelar
          </Btn>
          <Btn variant="success" onPress={handleConfirmClose} loading={loading} style={{ flex: 1 }}>
            Confirmar Fechamento
          </Btn>
        </View>
      </BottomModal>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, padding: 16 },

  closingBanner: {
    backgroundColor: "rgba(232,160,32,.1)",
    borderWidth: 1,
    borderColor: "rgba(232,160,32,.4)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  closingBannerText: { color: C.amber, fontWeight: "600", marginBottom: 10 },
  closingBannerBtns: { flexDirection: "row", gap: 10, width: "100%" },

  infoCard: { marginBottom: 16, padding: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  infoLabel: { color: C.muted, fontSize: 14 },
  infoVal: { fontWeight: "600", color: C.cream, fontSize: 14 },

  sectionTitle: { fontSize: 17, color: C.cream, fontWeight: "700", marginBottom: 10 },

  prodSelector: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 11,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  qtyRow: { flexDirection: "row", gap: 8, marginBottom: 22, alignItems: "center" },
  qtyBtn: {
    width: 40,
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: { color: C.cream, fontSize: 20, fontWeight: "700" },
  qtyInput: {
    width: 52,
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
    color: C.cream,
    fontSize: 16,
    textAlign: "center",
  },
  addBtn: { flex: 1, height: 42 },

  empty: { textAlign: "center", color: C.muted, paddingVertical: 30 },

  itemCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginBottom: 8 },
  itemIcon: { fontSize: 22 },
  itemName: { fontSize: 14, fontWeight: "600", color: C.cream },
  itemMeta: { fontSize: 12, color: C.muted },
  itemTotal: { fontSize: 14, fontWeight: "700", color: C.amber },
  delBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(224,80,80,.3)",
    backgroundColor: "rgba(224,80,80,.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  totalLabel: { color: C.muted, fontSize: 14 },
  totalVal: { fontSize: 28, color: C.amber, fontWeight: "900" },

  prodItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  fullWidth: { width: "100%", marginTop: 12 },

  payTitle: { fontSize: 15, color: C.cream, fontWeight: "700", marginBottom: 10 },
  payGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  payOption: {
    width: "47%",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  closeBtns: { flexDirection: "row", gap: 10 },
});
