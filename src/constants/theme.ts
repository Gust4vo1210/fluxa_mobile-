export const C = {
  bg: "#0f0d0a",
  surface: "#1a1710",
  surface2: "#252118",
  surface3: "#2e2820",
  amber: "#e8a020",
  amberL: "#f5c060",
  amberD: "#b07010",
  cream: "#f5efe0",
  muted: "#8a7f6a",
  danger: "#e05050",
  success: "#50c878",
  info: "#5090e0",
  border: "rgba(232,160,32,0.18)",
} as const;

export const CAT_ICONS: Record<string, string> = {
  bebidas: "🍺",
  comidas: "🍔",
  outros: "📦",
};

export const PAY_LABELS: Record<string, string> = {
  pix: "📱 PIX",
  credito: "💳 Crédito",
  debito: "💳 Débito",
  dinheiro: "💵 Dinheiro",
};
