import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-[430px] h-[calc(100vh-1rem)] sm:h-[min(932px,calc(100vh-2rem))] bg-background rounded-[2rem] sm:rounded-[3rem] shadow-soft overflow-hidden relative border-4 sm:border-8 border-foreground/10">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-7 bg-foreground/10 rounded-b-xl sm:rounded-b-2xl z-50" />
        
        {/* Screen content */}
        <div className="h-full overflow-hidden flex flex-col pt-6 sm:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
