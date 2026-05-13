import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Btn, Card, Input, useToast } from "../../src/components/ui";
import { C } from "../../src/constants/theme";
import { registerSchema } from "../../src/services/auth.service";
import { useAuthStore } from "../../src/store/authStore";
import type { UserRole } from "../../src/types";

// NOTE: In production, restaurant_id would come from a QR code scan,
// an invite link, or an onboarding flow. For now we use a fixed placeholder.
const DEFAULT_RESTAURANT_ID = "restaurant_001";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  const { showToast, ToastComponent } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const result = registerSchema.safeParse({
      name,
      email,
      password: pass,
      role,
      restaurant_id: DEFAULT_RESTAURANT_ID,
    });
    if (!result.success) {
      showToast(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await register({
        name,
        email,
        password: pass,
        role,
        restaurant_id: DEFAULT_RESTAURANT_ID,
      });
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Criar Conta</Text>
        <Text style={styles.subheading}>Bem-vindo ao Matutus Cozinha &amp; Bar</Text>

        <Card style={styles.card}>
          <Input
            label="Nome completo"
            value={name}
            onChangeText={setName}
            placeholder="Ex: João Silva"
          />
          <Input
            label="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
          />
          <Input
            label="Senha"
            secureTextEntry
            value={pass}
            onChangeText={setPass}
            placeholder="Mínimo 4 caracteres"
          />

          <Text style={styles.roleLabel}>Perfil de acesso</Text>
          <View style={styles.roleRow}>
            {(
              [
                ["admin", "👑  Gerente"],
                ["waiter", "🍽️  Garçom"],
              ] as [UserRole, string][]
            ).map(([v, l]) => (
              <TouchableOpacity
                key={v}
                onPress={() => setRole(v)}
                style={[
                  styles.roleBtn,
                  {
                    borderColor: role === v ? C.amber : C.border,
                    backgroundColor:
                      role === v ? "rgba(232,160,32,.13)" : C.surface2,
                  },
                ]}
              >
                <Text style={{ color: role === v ? C.amber : C.muted, fontWeight: "600" }}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Btn onPress={handleRegister} loading={loading} style={styles.fullWidth}>
            Cadastrar →
          </Btn>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {ToastComponent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingBottom: 40 },

  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  backText: { color: C.amber, fontSize: 15, fontWeight: "600" },

  heading: { fontSize: 30, color: C.amber, fontWeight: "800", marginBottom: 4 },
  subheading: { fontSize: 14, color: C.muted, marginBottom: 24 },

  card: { padding: 20 },

  roleLabel: { fontSize: 13, color: C.muted, fontWeight: "600", marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  roleBtn: {
    flex: 1,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },

  fullWidth: { width: "100%" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  footerText: { fontSize: 13, color: C.muted },
  footerLink: { fontSize: 13, color: C.amber, fontWeight: "700" },
});
