import Header from "./Header";
import HeroSection from "./HeroSection";
import TechProofStrip from "./TechProofStrip";
import FeaturesSection from "./FeaturesSection";
import AIDemoSection from "./AIDemoSection";
import ColorHarmonySection from "./ColorHarmonySection";
import FloatingAssistant from "./FloatingAssistant";
import LandingFooter from "./LandingFooter";

export default function LandingPage({
  onStartStyling,
  onWatchDemo,
  onSignIn,
  onOpenChat,
  onStartVoice,
  listening = false,
  assistantHidden = false,
  userMenu = null,
  heroImage,
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        onSignIn={onSignIn}
        onWatchDemo={onWatchDemo}
        userMenu={userMenu}
      />
      <main>
        <HeroSection
          onStartStyling={onStartStyling}
          onWatchDemo={onWatchDemo}
          heroImage={heroImage}
        />
        <TechProofStrip />
        <FeaturesSection />
        <AIDemoSection />
        <ColorHarmonySection />
      </main>
      <LandingFooter
        onGetStarted={onStartStyling}
        onViewDemo={onWatchDemo}
      />
      <FloatingAssistant
        onOpenChat={onOpenChat}
        onStartVoice={onStartVoice}
        listening={listening}
        hidden={assistantHidden}
      />
    </div>
  );
}
