import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal as RNModal,
  ScrollView,
  Animated,
  ActivityIndicator,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { C } from "../constants/theme";

// ─── BUTTON ──────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "danger" | "success" | "ghost";

interface BtnProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: BtnVariant;
  sm?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

export function Btn({
  children,
  onPress,
  variant = "primary",
  sm,
  style,
  textStyle,
  disabled,
  loading,
}: BtnProps) {
  const variantStyles: Record<BtnVariant, { bg: string; color: string; border?: string }> = {
    primary: { bg: C.amber, color: "#1a0f00" },
    secondary: { bg: C.surface2, color: C.cream, border: C.border },
    danger: { bg: "rgba(224,80,80,.13)", color: C.danger, border: "rgba(224,80,80,.3)" },
    success: { bg: "rgba(80,200,120,.13)", color: C.success, border: "rgba(80,200,120,.3)" },
    ghost: { bg: "transparent", color: C.amber },
  };

  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={0.75}
      style={[
        styles.btn,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? "transparent",
          borderWidth: v.border ? 1 : 0,
          paddingVertical: sm ? 8 : 14,
          paddingHorizontal: sm ? 14 : 22,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.color} size="small" />
      ) : (
        <Text style={[styles.btnText, { color: v.color, fontSize: sm ? 13 : 15 }, textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────
interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, containerStyle, ...props }: InputProps) {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        placeholderTextColor={C.muted}
        {...props}
        style={[styles.input, props.style as TextStyle]}
      />
    </View>
  );
}

// ─── CARD ────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── MODAL ────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function BottomModal({ open, onClose, title, subtitle, children }: ModalProps) {
  return (
    <RNModal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          {subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────
interface TopBarProps {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function TopBar({ title, onBack, action }: TopBarProps) {
  return (
    <View style={styles.topBar}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.topBarBack}>
          <Text style={styles.topBarBackText}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.topBarTitle} numberOfLines={1}>
        {title}
      </Text>
      {action && <View>{action}</View>}
    </View>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  val: string | number;
  label: string;
  color?: string;
}

export function StatCard({ icon, val, label, color }: StatCardProps) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statVal, { color: color ?? C.amber }]}>{val}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────
// Usage: const { showToast, ToastComponent } = useToast()
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);

  const showToast = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2400);
  };

  const ToastComponent = msg ? (
    <View style={styles.toast} pointerEvents="none">
      <Text style={styles.toastText}>{msg}</Text>
    </View>
  ) : null;

  return { showToast, ToastComponent };
}

// ─── STYLES ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  btnText: {
    fontWeight: "700",
    fontFamily: "System",
  },

  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: C.muted, fontWeight: "600", marginBottom: 7 },
  input: {
    padding: 11,
    paddingHorizontal: 14,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    color: C.cream,
    fontSize: 15,
  },

  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 28,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    color: C.amber,
    marginBottom: 4,
    fontWeight: "700",
  },
  modalSubtitle: { fontSize: 13, color: C.muted, marginBottom: 20 },

  topBar: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topBarBack: { paddingRight: 6 },
  topBarBackText: { color: C.amber, fontSize: 22 },
  topBarTitle: {
    flex: 1,
    fontSize: 20,
    color: C.amber,
    fontWeight: "700",
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    minWidth: 80,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2, textAlign: "center" },

  toast: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 10,
    zIndex: 999,
  },
  toastText: { color: C.cream, fontSize: 14 },
});
