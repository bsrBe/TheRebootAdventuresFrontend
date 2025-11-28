import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { initTelegramWebApp, getTelegramUser, TelegramWebApp } from '../utils/telegram';

export interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: ReturnType<typeof getTelegramUser>;
  isTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<ReturnType<typeof getTelegramUser>>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const tg = initTelegramWebApp();


    if (tg) {


      const tgUser = getTelegramUser(tg);

      if (tgUser) {

        setWebApp(tg);
        setUser(tgUser);
        setIsTelegram(true);
      } else {


        // In production, we still set the WebApp even if user is missing (might be just browsing)
        setWebApp(tg);
        setIsTelegram(true);
      }
    } else {

    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, user, isTelegram }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = (): TelegramContextType => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};
