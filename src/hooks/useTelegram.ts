import { useTelegram as useTelegramContext } from '@/contexts/TelegramContext';

export const useTelegram = () => {
  const { webApp, user, isTelegram } = useTelegramContext();
  
  return {
    isReady: isTelegram,
    user,
    webApp,
    isTelegram,
    // For backward compatibility
    initData: webApp?.initData,
    initDataUnsafe: webApp?.initDataUnsafe,
  };
};
