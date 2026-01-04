import { RegistrationForm } from "@/components/RegistrationForm";
import { useTelegram } from "@/hooks/useTelegram";
import { api } from "@/services/api";
import heroImage from "@/assets/RebootWelcome.jpg";
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Image Section - Constrained height on mobile, full height on desktop */}
      <div className="w-full h-[40vh] md:w-1/2 lg:w-5/12 md:h-screen md:sticky md:top-0 relative bg-muted overflow-hidden">
        <img
          src={heroImage}
          alt="Welcome to Reboot Adventures"
          className="w-full h-full object-cover md:object-center object-top"
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Text Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 text-white z-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Reboot Adventures
          </h1>
          {user && (
            <p className="text-base sm:text-lg text-white/90 mb-2 sm:mb-3">
              Welcome back, <span className="font-semibold">{user.first_name}</span>! 👋
            </p>
          )}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <span>📍</span>
            <p>Meetup at <span className="font-semibold text-accent">Reboot Coffee, 4 Kilo</span></p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col justify-center p-6 md:p-12 lg:p-16">
        <div className="max-w-lg mx-auto w-full">
          {/* Header removed from here as it's now on the image */}

          <RegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
