import type { Table } from "../types";

export const fmt = (v: number): string =>
  `R$ ${v.toFixed(2).replace(".", ",")}`;

export const nowTime = (): string =>
  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const tableTotal = (tbl: Table): number =>
  tbl.items.reduce((s, i) => s + i.price * i.qty, 0);

export const todayDate = (): string =>
  new Date().toLocaleDateString("pt-BR");

export const todayLabel = (): string =>
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
