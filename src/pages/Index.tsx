import { RegistrationForm } from "@/components/RegistrationForm";
import { useTelegram } from "@/hooks/useTelegram";
import { api } from "@/services/api";
import heroImage from "@/assets/horseback-hero.jpg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isReady, user, webApp, isTelegram } = useTelegram();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      if (isReady && isTelegram && user) {
        console.log('Checking registration for user:', user.id);
        setIsCheckingAuth(true);

        try {
          // Add a timeout to prevent long delays
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );

          const userDataPromise = api.getUserByTelegramId(user.id);

          const userData = await Promise.race([userDataPromise, timeoutPromise]) as any;
          console.log('User data received:', userData);

          // Check if user exists AND has completed registration (has a name)
          if (userData && userData.data && userData.data.fullName) {
            console.log('User is registered, redirecting to events...');
            // User is already registered, redirect to events immediately
            navigate('/events', { replace: true });
            return;
          } else {
            console.log('User is NOT registered or missing fullName');
          }
        } catch (error) {
          // User not found or error, stay on registration page
          console.log('User not registered or error checking status:', error);
        } finally {
          setIsCheckingAuth(false);
          setAuthChecked(true);
        }
      } else if (isReady && !isTelegram) {
        // Not in Telegram, don't check auth
        setIsCheckingAuth(false);
        setAuthChecked(true);
      }
    };

    checkRegistration();
  }, [isReady, isTelegram, user, navigate]);

  // Show loading only while checking authentication for the first time
  if (isCheckingAuth || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Checking registration status...
          </p>
        </div>
      </div>
    );
  }

  // Only block on the very first Telegram initialization
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading Reboot Adventures...
          </p>
          {!isTelegram && isReady && (
            <p className="mt-4 text-sm text-muted-foreground">
              For the best experience, open this app in Telegram
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header with Background */}
      <div className="relative h-32 sm:h-40 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Reboot Adventures
          </h1>
          {user && (
            <p className="text-white/90 mb-2">
              Welcome back, <span className="font-semibold">{user.first_name}</span>! 👋
            </p>
          )}
          <div className="text-xs sm:text-sm text-white/90 space-y-0.5">
            <p>Meetup at <span className="font-semibold text-accent">Reboot Coffee, 4 Kilo</span></p>
          </div>
        </div>
      </div>

      {/* Form Container - Mobile Optimized */}
      <div className="px-4 py-6 sm:px-6 max-w-lg mx-auto">
        <RegistrationForm />
      </div>
    </div>
  );
};

export default Index;
