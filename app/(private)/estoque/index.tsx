import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../src/store/authStore";
import { useRestaurantStore } from "../../../src/store/restaurantStore";
import { TopBar, Btn, Input, Card, BottomModal, useToast } from "../../../src/components/ui";
import { C, CAT_ICONS } from "../../../src/constants/theme";
import type { ProductCategory, ProductUnit } from "../../../src/types";

const CATS: ProductCategory[] = ["bebidas", "comidas", "outros"];
const UNITS: { value: ProductUnit; label: string }[] = [
  { value: "un", label: "Unidade (un)" },
  { value: "L", label: "Litro (L)" },
  { value: "kg", label: "Kilo (kg)" },
  { value: "cx", label: "Caixa (cx)" },
];

export default function EstoqueScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { products, fetchProducts, addProduct, updateQty, removeProduct } = useRestaurantStore();
  const { showToast, ToastComponent } = useToast();

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"Todas" | ProductCategory>("Todas");
  const [modal, setModal] = useState(false);

  // New product form
  const [pName, setPName] = useState("");
  const [pCat, setPCat] = useState<ProductCategory>("bebidas");
  const [pPrice, setPPrice] = useState("");
  const [pQty, setPQty] = useState("");
  const [pUnit, setPUnit] = useState<ProductUnit>("un");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.restaurant_id) fetchProducts(user.restaurant_id);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (cat === "Todas" || p.cat === cat)
  );

  async function handleSave() {
    if (!pName.trim()) { showToast("Informe o nome do produto!"); return; }
    if (!user?.restaurant_id) return;
    setSaving(true);
    try {
      await addProduct({
        name: pName.trim(),
        cat: pCat,
        price: parseFloat(pPrice) || 0,
        qty: parseInt(pQty) || 0,
        unit: pUnit,
        restaurant_id: user.restaurant_id,
      });
      setModal(false);
      setPName(""); setPPrice(""); setPQty("");
      showToast("Produto cadastrado! ✓");
    } catch {
      showToast("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function handleQty(id: number, delta: number) {
    try {
      await updateQty(id, delta);
    } catch {
      showToast("Erro ao atualizar estoque");
    }
  }

  async function handleDelete(id: number) {
    try {
      await removeProduct(id);
      showToast("Removido");
    } catch {
      showToast("Erro ao remover produto");
    }
  }

  return (
    <View style={styles.root}>
      <TopBar
        title="📦 Estoque"
        onBack={() => router.back()}
        action={<Btn sm onPress={() => setModal(true)}>+ Produto</Btn>}
      />

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="🔍 Buscar produto..."
          placeholderTextColor={C.muted}
          style={styles.searchInput}
        />
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {(["Todas", ...CATS] as const).map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCat(c as any)}
            style={[
              styles.filterBtn,
              {
                borderColor: cat === c ? C.amber : C.border,
                backgroundColor: cat === c ? "rgba(232,160,32,.13)" : C.surface2,
              },
            ]}
          >
            <Text style={{ color: cat === c ? C.amber : C.muted, fontWeight: "600", fontSize: 13 }}>
              {c === "Todas" ? "Todas" : `${CAT_ICONS[c]} ${c}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>Nenhum produto encontrado</Text>
        ) : (
          filtered.map((p) => (
            <Card key={p.id} style={styles.productCard}>
              <Text style={styles.productIcon}>{p.icon || CAT_ICONS[p.cat]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{p.name}</Text>
                <Text style={styles.productMeta}>{p.cat} • R$ {p.price.toFixed(2)}</Text>
              </View>
              <View style={styles.productRight}>
                <Text style={[styles.productQty, { color: p.qty < 10 ? C.danger : C.amber }]}>
                  {p.qty}
                </Text>
                <Text style={styles.productUnit}>{p.unit}</Text>
                <View style={styles.qtyRow}>
                  {(([["−", -1], ["+", 1]] as [string, number][])).map(([l, d]) => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => handleQty(p.id, d)}
                      style={styles.qtyBtn}
                    >
                      <Text style={{ color: C.cream, fontSize: 16, fontWeight: "700" }}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => handleDelete(p.id)} style={styles.delBtn}>
                    <Text style={{ fontSize: 13 }}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add product modal */}
      <BottomModal open={modal} onClose={() => setModal(false)} title="Cadastrar Produto" subtitle="Adicione ao estoque do Matutus">
        <Input label="Nome do produto" value={pName} onChangeText={setPName} placeholder="Ex: Cerveja Heineken" />

        <Text style={styles.modalLabel}>Categoria</Text>
        <View style={styles.catRow}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setPCat(c)}
              style={[
                styles.catBtn,
                {
                  borderColor: pCat === c ? C.amber : C.border,
                  backgroundColor: pCat === c ? "rgba(232,160,32,.13)" : C.surface2,
                },
              ]}
            >
              <Text style={{ color: pCat === c ? C.amber : C.muted, fontSize: 13, fontWeight: "600" }}>
                {CAT_ICONS[c]} {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.priceRow}>
          <View style={{ flex: 1 }}>
            <Input label="Preço (R$)" keyboardType="numeric" value={pPrice} onChangeText={setPPrice} placeholder="0.00" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Qtd. inicial" keyboardType="numeric" value={pQty} onChangeText={setPQty} placeholder="0" />
          </View>
        </View>

        <Text style={styles.modalLabel}>Unidade</Text>
        <View style={styles.unitRow}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u.value}
              onPress={() => setPUnit(u.value)}
              style={[
                styles.unitBtn,
                {
                  borderColor: pUnit === u.value ? C.amber : C.border,
                  backgroundColor: pUnit === u.value ? "rgba(232,160,32,.13)" : C.surface2,
                },
              ]}
            >
              <Text style={{ color: pUnit === u.value ? C.amber : C.muted, fontSize: 12, fontWeight: "600" }}>
                {u.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalBtns}>
          <Btn variant="secondary" onPress={() => setModal(false)} style={{ flex: 1 }}>Cancelar</Btn>
          <Btn onPress={handleSave} loading={saving} style={{ flex: 1 }}>Salvar</Btn>
        </View>
      </BottomModal>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  searchRow: { padding: 12, paddingBottom: 8 },
  searchInput: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    color: C.cream,
    fontSize: 14,
  },
  filterScroll: { paddingHorizontal: 16, marginBottom: 8 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  list: { flex: 1, paddingHorizontal: 16 },
  empty: { textAlign: "center", color: C.muted, marginTop: 40 },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
  },
  productIcon: { fontSize: 26, width: 36, textAlign: "center" },
  productName: { fontSize: 15, fontWeight: "700", color: C.cream },
  productMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  productRight: { alignItems: "flex-end" },
  productQty: { fontSize: 22, fontWeight: "800" },
  productUnit: { fontSize: 11, color: C.muted },
  qtyRow: { flexDirection: "row", gap: 5, marginTop: 5 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
    justifyContent: "center",
    alignItems: "center",
  },
  delBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(224,80,80,.3)",
    backgroundColor: "rgba(224,80,80,.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalLabel: { fontSize: 13, color: C.muted, fontWeight: "600", marginBottom: 8 },
  catRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  catBtn: { flex: 1, padding: 9, borderRadius: 9, borderWidth: 1, alignItems: "center" },
  priceRow: { flexDirection: "row", gap: 12 },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  unitBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1 },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
});
