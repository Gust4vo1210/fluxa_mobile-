import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../src/store/authStore";
import { TopBar, Btn, Input, Card, BottomModal, useToast } from "../../../src/components/ui";
import { C } from "../../../src/constants/theme";
// NOTE: Replace with a real waitersApi when your backend is ready.
// For now we manage waiters locally via the auth store user list or
// a dedicated endpoint. Adjust the import below accordingly.
// import { waitersApi } from "../../../src/api/restaurant.api";

// ─── Local state (replace with real API calls) ────────────────────
import { useState as useLocalState } from "react";

interface LocalWaiter {
  id: number;
  name: string;
  email: string;
}

export default function GarconsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { showToast, ToastComponent } = useToast();

  // TODO: replace with useWaitersStore or fetched from API
  const [waiters, setWaiters] = useLocalState<LocalWaiter[]>([]);
  const [nextId, setNextId] = useState(1);

  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name || !email || !pass) { showToast("Preencha todos os campos!"); return; }
    if (waiters.find((w) => w.email === email)) { showToast("E-mail já cadastrado!"); return; }
    setSaving(true);
    try {
      // TODO: replace with API call
      // await waitersApi.create({ name, email, password: pass, restaurant_id: user?.restaurant_id })
      setWaiters((prev) => [...prev, { id: nextId, name, email }]);
      setNextId((n) => n + 1);
      setModal(false);
      setName(""); setEmail(""); setPass("");
      showToast("Garçom cadastrado! ✓");
    } catch {
      showToast("Erro ao cadastrar garçom");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: number) {
    setWaiters((prev) => prev.filter((w) => w.id !== id));
    showToast("Removido");
  }

  return (
    <View style={styles.root}>
      <TopBar
        title="👨‍🍳 Garçons"
        onBack={() => router.back()}
        action={<Btn sm onPress={() => setModal(true)}>+ Garçom</Btn>}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {waiters.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👨‍🍳</Text>
            <Text style={styles.emptyText}>Nenhum garçom cadastrado</Text>
            <Text style={styles.emptyHint}>Toque em "+ Garçom" para adicionar</Text>
          </View>
        ) : (
          waiters.map((w) => (
            <Card key={w.id} style={styles.waiterCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{w.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.waiterName}>{w.name}</Text>
                <Text style={styles.waiterEmail}>{w.email}</Text>
              </View>
              <View style={styles.waiterRight}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Garçom</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(w.id)} style={styles.delBtn}>
                  <Text style={{ fontSize: 14 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <BottomModal
        open={modal}
        onClose={() => setModal(false)}
        title="Cadastrar Garçom"
        subtitle="O garçom poderá fazer login no app"
      >
        <Input label="Nome completo" value={name} onChangeText={setName} placeholder="Ex: Ana Costa" />
        <Input
          label="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholder="email@matutus.com"
        />
        <Input label="Senha" secureTextEntry value={pass} onChangeText={setPass} placeholder="Crie uma senha" />
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ O garçom terá acesso apenas às comandas. Estoque, garçons e relatório são exclusivos do gerente.
          </Text>
        </View>
        <View style={styles.modalBtns}>
          <Btn variant="secondary" onPress={() => setModal(false)} style={{ flex: 1 }}>Cancelar</Btn>
          <Btn onPress={handleSave} loading={saving} style={{ flex: 1 }}>Cadastrar</Btn>
        </View>
      </BottomModal>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, padding: 16 },

  empty: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: C.muted, fontSize: 15 },
  emptyHint: { color: C.muted, fontSize: 13, marginTop: 4 },

  waiterCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.amber,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#1a0f00" },
  waiterName: { fontSize: 15, fontWeight: "700", color: C.cream },
  waiterEmail: { fontSize: 12, color: C.muted, marginTop: 2 },
  waiterRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    backgroundColor: "rgba(80,144,224,.15)",
    borderWidth: 1,
    borderColor: "rgba(80,144,224,.3)",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, color: C.info, fontWeight: "700" },
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

  infoBox: {
    backgroundColor: "rgba(80,144,224,.08)",
    borderWidth: 1,
    borderColor: "rgba(80,144,224,.2)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  infoText: { fontSize: 12, color: C.muted, lineHeight: 18 },
  modalBtns: { flexDirection: "row", gap: 10 },
});
