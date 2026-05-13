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
import { loginSchema } from "../../src/services/auth.service";
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { showToast, ToastComponent } = useToast();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const result = loginSchema.safeParse({ email, password: pass });
    if (!result.success) {
      showToast(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await login({ email, password: pass });
      // RootLayout will redirect to dashboard automatically
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? "E-mail ou senha incorretos!");
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
        {/* Logo row */}
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🍽️</Text>
          </View>
          <View>
            <Text style={styles.logoName}>Matutus</Text>
            <Text style={styles.logoSub}>Cozinha &amp; Bar</Text>
          </View>
        </View>

        <Text style={styles.heading}>Entrar</Text>
        <Text style={styles.subheading}>Acesse com sua conta</Text>

        <Card style={styles.card}>
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
            placeholder="Sua senha"
          />
          <View style={styles.demoBox}>
            <Text style={styles.demoText}>💡 Demo: admin@matutus.com / 1234</Text>
          </View>
          <Btn onPress={handleLogin} loading={loading} style={styles.fullWidth}>
            Entrar →
          </Btn>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.footerLink}>Cadastrar</Text>
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

  logoRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 28 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.amber,
    justifyContent: "center",
    alignItems: "center",
  },
  logoEmoji: { fontSize: 22 },
  logoName: { fontSize: 20, color: C.amber, fontWeight: "700" },
  logoSub: { fontSize: 11, color: C.muted },

  heading: { fontSize: 30, color: C.cream, fontWeight: "800", marginBottom: 4 },
  subheading: { fontSize: 14, color: C.muted, marginBottom: 24 },

  card: { padding: 20 },
  demoBox: {
    backgroundColor: "rgba(232,160,32,.08)",
    borderWidth: 1,
    borderColor: "rgba(232,160,32,.2)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  demoText: { fontSize: 12, color: C.muted },
  fullWidth: { width: "100%" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  footerText: { fontSize: 13, color: C.muted },
  footerLink: { fontSize: 13, color: C.amber, fontWeight: "700" },
});
