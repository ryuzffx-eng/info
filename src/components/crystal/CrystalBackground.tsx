import { AuroraBackground } from "./AuroraBackground";
import { MeteorParticles } from "./MeteorParticles";
import { GlassMesh } from "./GlassMesh";
import { ParallaxProvider } from "./ParallaxContext";

export function CrystalBackground() {
  return (
    <ParallaxProvider>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <AuroraBackground />
        <MeteorParticles />
        <GlassMesh />
      </div>
    </ParallaxProvider>
  );
}
