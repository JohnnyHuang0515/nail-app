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
    <div className="min-h-screen bg-muted/30 flex justify-center">
      <div
        ref={containerRef}
        className="w-full max-w-md min-h-screen bg-background"
      >
        <MobileFrameContext.Provider value={container}>
          {children}
        </MobileFrameContext.Provider>
      </div>
    </div>
  );
};

export default MobileFrame;

