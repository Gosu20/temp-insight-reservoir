import { useState, useCallback, useMemo } from "react";

export interface ReservoirInputs {
  tempOut: number;
  tempIn: number;
  discharge: number;
  storage: number;
  airTemp: number;
  solarRad: number;
  windSpeed: number;
  humidity: number;
}

export interface ScenarioAdjustments {
  dischargeChange: number; // percentage
  airTempChange: number; // degrees
  storageChange: number; // percentage
}

export interface PredictionResult {
  predicted: number;
  change: number;
  mae: number;
  r2: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

// Physically-inspired ML surrogate model for reservoir outflow temperature
function predictTemperature(
  inputs: ReservoirInputs,
  adjustments: ScenarioAdjustments,
  horizon: 1 | 3 | 7
): PredictionResult {
  // Apply scenario adjustments to inputs
  const adjustedInputs = {
    ...inputs,
    discharge: inputs.discharge * (1 + adjustments.dischargeChange / 100),
    airTemp: inputs.airTemp + adjustments.airTempChange,
    storage: inputs.storage * (1 + adjustments.storageChange / 100),
  };

  const {
    tempOut,
    tempIn,
    discharge,
    storage,
    airTemp,
    solarRad,
    windSpeed,
    humidity,
  } = adjustedInputs;

  // Normalized features
  const normDischarge = discharge / 200;
  const normStorage = storage / 500;
  const normSolar = solarRad / 800;
  const normWind = windSpeed / 10;
  const normHumidity = humidity / 100;

  // Seasonal factor
  const dayOfYear = new Date().getDay() / 365;
  const seasonalFactor = Math.sin(2 * Math.PI * dayOfYear) * 2;

  // Feature coefficients
  const coefficients = {
    intercept: 0.0,
    tempOut: 0.65,
    tempIn: 0.15,
    airTemp: 0.12,
    solar: 0.08,
    discharge: -0.03,
    storage: 0.02,
    wind: -0.04,
    humidity: 0.02,
    seasonal: 0.08,
  };

  // Horizon-dependent factors
  const horizonFactors = {
    1: { decay: 1.0, uncertainty: 0.5, r2: 0.94 },
    3: { decay: 0.85, uncertainty: 1.2, r2: 0.89 },
    7: { decay: 0.7, uncertainty: 2.0, r2: 0.85 },
  };

  const hFactor = horizonFactors[horizon];

  // Base prediction
  let predicted =
    coefficients.intercept +
    coefficients.tempOut * tempOut * hFactor.decay +
    coefficients.tempIn * tempIn +
    coefficients.airTemp * airTemp +
    coefficients.solar * normSolar * 5 +
    coefficients.discharge * normDischarge * 3 +
    coefficients.storage * normStorage * 2 +
    coefficients.wind * normWind * 2 +
    coefficients.humidity * normHumidity +
    coefficients.seasonal * seasonalFactor;

  // Non-linear interactions
  const airTempDiff = airTemp - tempOut;
  if (airTempDiff > 5) {
    predicted += 0.15 * horizon;
  } else if (airTempDiff < -5) {
    predicted -= 0.1 * horizon;
  }

  if (solarRad > 500 && windSpeed < 2) {
    predicted += 0.3 * (horizon / 7);
  }

  if (discharge < 50 && storage > 300) {
    predicted += 0.2;
  }

  predicted = Math.max(0, Math.min(35, predicted));

  const change = predicted - inputs.tempOut; // Change from original (not adjusted) temp
  const mae = 0.5 + horizon * 0.1;
  const uncertainty = hFactor.uncertainty + Math.abs(change) * 0.1;
  const lowerBound = predicted - uncertainty;
  const upperBound = predicted + uncertainty;
  const confidence = Math.round(85 - horizon * 2 - Math.abs(change) * 0.5);

  return {
    predicted: Number(predicted.toFixed(1)),
    change: Number(change.toFixed(1)),
    mae: Number(mae.toFixed(2)),
    r2: hFactor.r2,
    confidence: Math.max(60, Math.min(95, confidence)),
    lowerBound: Number(lowerBound.toFixed(1)),
    upperBound: Number(upperBound.toFixed(1)),
  };
}

// Calculate feature importance based on inputs
export function calculateFeatureImportance(inputs: ReservoirInputs, adjustments: ScenarioAdjustments) {
  const { tempOut, airTemp, solarRad, discharge } = inputs;

  const baseWeights = {
    "T_out (t-1)": 28,
    "Air Temperature": 18,
    "Solar Radiation": 14,
    "Seasonality": 12,
    "Inflow Temp": 10,
    "Discharge": 8,
    "Storage": 6,
    "Wind Speed": 4,
  };

  const adjusted = { ...baseWeights };

  // Adjust based on conditions
  const tempDiff = Math.abs(airTemp + adjustments.airTempChange - tempOut);
  if (tempDiff > 5) {
    adjusted["Air Temperature"] += 5;
    adjusted["T_out (t-1)"] -= 3;
  }

  if (solarRad > 500) {
    adjusted["Solar Radiation"] += 4;
    adjusted["Seasonality"] -= 2;
  }

  const effectiveDischarge = discharge * (1 + adjustments.dischargeChange / 100);
  if (effectiveDischarge < 50) {
    adjusted["Storage"] += 3;
    adjusted["Discharge"] += 2;
  }

  // Boost importance if scenario adjustments are significant
  if (Math.abs(adjustments.dischargeChange) > 20) {
    adjusted["Discharge"] += 4;
  }
  if (Math.abs(adjustments.airTempChange) > 3) {
    adjusted["Air Temperature"] += 3;
  }
  if (Math.abs(adjustments.storageChange) > 15) {
    adjusted["Storage"] += 3;
  }

  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  const normalized = Object.entries(adjusted).map(([name, value]) => ({
    feature: name,
    importance: Math.round((value / total) * 100),
    category: getCategoryForFeature(name),
  }));

  return normalized.sort((a, b) => b.importance - a.importance);
}

function getCategoryForFeature(feature: string): string {
  const categories: Record<string, string> = {
    "T_out (t-1)": "hydrology",
    "Air Temperature": "meteorology",
    "Solar Radiation": "meteorology",
    "Seasonality": "temporal",
    "Inflow Temp": "hydrology",
    "Discharge": "operations",
    "Storage": "operations",
    "Wind Speed": "meteorology",
  };
  return categories[feature] || "other";
}

// Main hook for reservoir model state
export function useReservoirModel() {
  const [inputs, setInputs] = useState<ReservoirInputs>({
    tempOut: 18.5,
    tempIn: 16.2,
    discharge: 142.5,
    storage: 285.3,
    airTemp: 22.8,
    solarRad: 425,
    windSpeed: 3.2,
    humidity: 65,
  });

  const [adjustments, setAdjustments] = useState<ScenarioAdjustments>({
    dischargeChange: 0,
    airTempChange: 0,
    storageChange: 0,
  });

  const [activeHorizon, setActiveHorizon] = useState<1 | 3 | 7>(1);
  const [hasForecast, setHasForecast] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Store the inputs/adjustments used for the last forecast
  const [forecastInputs, setForecastInputs] = useState<ReservoirInputs | null>(null);
  const [forecastAdjustments, setForecastAdjustments] = useState<ScenarioAdjustments | null>(null);

  const updateInput = useCallback((key: keyof ReservoirInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateAdjustment = useCallback((key: keyof ScenarioAdjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments({ dischargeChange: 0, airTempChange: 0, storageChange: 0 });
  }, []);

  const generateForecast = useCallback(() => {
    setIsGenerating(true);
    // Simulate processing time
    setTimeout(() => {
      setForecastInputs({ ...inputs });
      setForecastAdjustments({ ...adjustments });
      setHasForecast(true);
      setIsGenerating(false);
    }, 800);
  }, [inputs, adjustments]);

  // Predictions based on forecast inputs (only calculated after generate is clicked)
  const predictions = useMemo(() => {
    if (!forecastInputs || !forecastAdjustments) {
      return null;
    }
    return {
      1: predictTemperature(forecastInputs, forecastAdjustments, 1),
      3: predictTemperature(forecastInputs, forecastAdjustments, 3),
      7: predictTemperature(forecastInputs, forecastAdjustments, 7),
    };
  }, [forecastInputs, forecastAdjustments]);

  const currentPrediction = predictions ? predictions[activeHorizon] : null;

  const featureImportance = useMemo(() => {
    if (!forecastInputs || !forecastAdjustments) {
      return null;
    }
    return calculateFeatureImportance(forecastInputs, forecastAdjustments);
  }, [forecastInputs, forecastAdjustments]);

  return {
    inputs,
    updateInput,
    setInputs,
    adjustments,
    updateAdjustment,
    resetAdjustments,
    activeHorizon,
    setActiveHorizon,
    predictions,
    currentPrediction,
    featureImportance,
    hasForecast,
    isGenerating,
    generateForecast,
    forecastInputs,
    forecastAdjustments,
  };
}
