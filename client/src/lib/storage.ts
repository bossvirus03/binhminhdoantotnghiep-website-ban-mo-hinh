import type { CartItem } from '../types';

const TOKEN_KEY = 'accessToken';
const CART_KEY = 'cart';
const CART_CHANGED_EVENT = 'cart:changed';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function getCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function subscribeCartChange(cb: () => void) {
  window.addEventListener(CART_CHANGED_EVENT, cb);
  // Also listen to storage events (cross-tab)
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_KEY) cb();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}
