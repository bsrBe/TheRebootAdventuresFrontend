import { WebAppUser } from '../types/telegram';

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  initData: string;
  initDataUnsafe: {
    user?: WebAppUser;
    query_id?: string;
    hash: string;
    // Add other properties as needed
  };
  // Add other WebApp methods as needed
}

export function initTelegramWebApp(): TelegramWebApp | null {
  // Check if running in Telegram WebView
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.warn('Telegram WebApp not detected');
    return null;
  }

  // Initialize WebApp
  tg.ready();
  tg.expand();
  
  // Note: enableClosingConfirmation is not available in all versions
  // It's safe to skip if not available

  return tg as unknown as TelegramWebApp;
}

export function getTelegramUser(tg: TelegramWebApp | null): WebAppUser | null {
  return tg?.initDataUnsafe?.user || null;
}

export function isTelegramWebApp(): boolean {
  return window.Telegram?.WebApp !== undefined;
}

export function getInitData(tg: TelegramWebApp | null): string | null {
  return tg?.initData || null;
}
