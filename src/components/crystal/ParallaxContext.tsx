import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Parallax = { x: number; y: number };

const ParallaxContext = createContext<Parallax>({ x: 0.5, y: 0.5 });

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const [mouse, setMouse] = useState<Parallax>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <ParallaxContext.Provider value={mouse}>{children}</ParallaxContext.Provider>;
}

export function useParallax() {
  return useContext(ParallaxContext);
}
