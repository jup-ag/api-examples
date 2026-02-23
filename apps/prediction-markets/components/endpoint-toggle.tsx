"use client";

import { createContext, useContext, useState } from "react";
import { Code, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "@/components/guided-tour";

interface EndpointContextValue {
  showEndpoints: boolean;
  setShowEndpoints: (show: boolean) => void;
}

const EndpointContext = createContext<EndpointContextValue>({
  showEndpoints: true,
  setShowEndpoints: () => {},
});

export function useEndpoints() {
  return useContext(EndpointContext);
}

export function EndpointProvider({ children }: { children: React.ReactNode }) {
  const [showEndpoints, setShowEndpoints] = useState(true);
  const { startTour, isActive } = useTour();

  const handleStartTour = () => {
    setShowEndpoints(true);
    startTour();
  };

  return (
    <EndpointContext.Provider value={{ showEndpoints, setShowEndpoints }}>
      {children}
      {!isActive && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <Button size="sm" onClick={handleStartTour} className="gap-2 rounded-full">
            <Play className="h-3.5 w-3.5" />
            API Tour
          </Button>
          <Button
            size="sm"
            variant={showEndpoints ? "default" : "secondary"}
            onClick={() => setShowEndpoints(!showEndpoints)}
            className="gap-2 rounded-full"
          >
            <Code className="h-3.5 w-3.5" />
            {showEndpoints ? "Hide API Endpoints" : "Show API Endpoints"}
          </Button>
        </div>
      )}
    </EndpointContext.Provider>
  );
}
