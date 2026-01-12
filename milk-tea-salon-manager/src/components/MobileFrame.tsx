import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="h-screen bg-muted/30 flex justify-center overflow-hidden">
      <div className="w-full max-w-md h-screen bg-background overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default MobileFrame;

