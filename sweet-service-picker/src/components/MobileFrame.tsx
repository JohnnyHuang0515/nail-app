import { ReactNode, createContext, useContext, useState, useCallback } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrameContext = createContext<HTMLDivElement | null>(null);

export const useMobileFrameContainer = () => useContext(MobileFrameContext);

const MobileFrame = ({ children }: MobileFrameProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainer(node);
    }
  }, []);

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
      {/* iPhone 14 Pro Max ratio: 430 x 932 (roughly 19.5:9) */}
      <div 
        ref={containerRef}
        className="w-full max-w-[430px] h-[93vh] max-h-[932px] bg-background rounded-[40px] border-[3px] border-milk-tea/40 shadow-soft overflow-hidden relative"
      >
        {/* Phone Notch - overlay on top of content */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground/90 rounded-b-2xl z-50" />

        {/* Screen Content - no top padding, content scrolls under notch */}
        <div className="relative h-full overflow-hidden">
          <MobileFrameContext.Provider value={container}>
            {children}
          </MobileFrameContext.Provider>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full z-50" />
      </div>
    </div>
  );
};

export default MobileFrame;
