import React, { createContext, useContext, ReactNode } from "react";
import { useReservoirModel, ReservoirInputs, PredictionResult } from "@/hooks/useReservoirModel";

interface ReservoirContextType {
  inputs: ReservoirInputs;
  updateInput: (key: keyof ReservoirInputs, value: number) => void;
  setInputs: React.Dispatch<React.SetStateAction<ReservoirInputs>>;
  activeHorizon: 1 | 3 | 7;
  setActiveHorizon: (horizon: 1 | 3 | 7) => void;
  predictions: Record<1 | 3 | 7, PredictionResult>;
  currentPrediction: PredictionResult;
  featureImportance: Array<{ feature: string; importance: number; category: string }>;
}

const ReservoirContext = createContext<ReservoirContextType | null>(null);

export function ReservoirProvider({ children }: { children: ReactNode }) {
  const model = useReservoirModel();

  return (
    <ReservoirContext.Provider value={model}>
      {children}
    </ReservoirContext.Provider>
  );
}

export function useReservoir() {
  const context = useContext(ReservoirContext);
  if (!context) {
    throw new Error("useReservoir must be used within a ReservoirProvider");
  }
  return context;
}
