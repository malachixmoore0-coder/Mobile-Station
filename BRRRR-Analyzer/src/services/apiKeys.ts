import { getSecureItem, setSecureItem, deleteSecureItem } from '@/services/secureStorage';

const KEYS = {
  rentcast: 'brrrr-scout.apikey.rentcast',
  googlePlaces: 'brrrr-scout.apikey.googleplaces',
} as const;

export type ApiProvider = keyof typeof KEYS;

export async function getApiKey(provider: ApiProvider): Promise<string | null> {
  const v = await getSecureItem(KEYS[provider]);
  return v && v.length > 0 ? v : null;
}

export async function setApiKey(provider: ApiProvider, value: string): Promise<void> {
  if (!value) {
    await deleteSecureItem(KEYS[provider]);
    return;
  }
  await setSecureItem(KEYS[provider], value);
}

export async function clearApiKey(provider: ApiProvider): Promise<void> {
  await deleteSecureItem(KEYS[provider]);
}
