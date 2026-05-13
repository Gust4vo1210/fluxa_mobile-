// salvar e recupera token de autenticação, armazena de forma segura

import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants/storageKeys";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
}

export async function getToken() {
  return await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
}
