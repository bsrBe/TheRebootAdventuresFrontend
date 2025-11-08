import { RegistrationForm } from "@/components/RegistrationForm";
import { useTelegram } from "@/hooks/useTelegram";
import heroImage from "@/assets/horseback-hero.jpg";

const Index = () => {
  const { isReady } = useTelegram();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
          <div className="text-xs sm:text-sm text-white/90 space-y-0.5">
            <p><span className="font-semibold">September 29th</span></p>
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
