/**
 * Constantes para as chaves do AsyncStorage
 * Centraliza todas as chaves de armazenamento do app
 */

export const STORAGE_KEYS = {
  USERS: '@meuprimeiroapp:users',
  USER_PREFIX: '@meuprimeiroapp:user:',
  THEME: '@meuprimeiroapp:theme',
} as const;

// Função auxiliar para gerar chave de usuário individual
export const getUserKey = (userId: string) => `${STORAGE_KEYS.USER_PREFIX}${userId}`;
