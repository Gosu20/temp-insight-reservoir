"""
FastAPI prediction endpoint
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from models.reservoir_model import ReservoirTemperatureModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="Reservoir Temperature Prediction API")

# Load models
models = {
    1: ReservoirTemperatureModel.load('models/saved/reservoir_gbm_h1.pkl'),
    3: ReservoirTemperatureModel.load('models/saved/reservoir_gbm_h3.pkl'),
    7: ReservoirTemperatureModel.load('models/saved/reservoir_gbm_h7.pkl')
}


class PredictionInput(BaseModel):
    t_out_current: float
    t_in_current: float
    discharge: float
    inflow: float
    storage: float
    release_rate: float
    air_temp: float
    solar_rad: float
    wind_speed: float
    humidity: float
    date: str  # ISO format


class PredictionOutput(BaseModel):
    horizon: int
    predicted_temp: float
    lower_bound: float
    upper_bound: float
    feature_importance: dict
    shap_values: Optional[List[float]] = None


@app.post("/predict/{horizon}", response_model=PredictionOutput)
async def predict_temperature(horizon: int, input_data: PredictionInput):
    """
    Predict reservoir outflow temperature
    
    Args:
        horizon: Forecast horizon (1, 3, or 7 days)
        input_data: Current reservoir and meteorological conditions
    """
    if horizon not in [1, 3, 7]:
        raise HTTPException(status_code=400, detail="Horizon must be 1, 3, or 7 days")
    
    model = models[horizon]
    
    # Convert input to DataFrame
    df = pd.DataFrame([{
        't_out': input_data.t_out_current,
        't_in': input_data.t_in_current,
        'discharge': input_data.discharge,
        'inflow': input_data.inflow,
        'storage': input_data.storage,
        'release_rate': input_data.release_rate,
        'air_temp': input_data.air_temp,
        'solar_rad': input_data.solar_rad,
        'wind_speed': input_data.wind_speed,
        'humidity': input_data.humidity
    }])
    df.index = pd.to_datetime([input_data.date])
    
    # Create features
    X = model.create_features(df)
    
    # Generate prediction with uncertainty
    pred, lower, upper = model.predict(X, return_uncertainty=True)
    
    # Get feature importance
    importance = model.get_feature_importance()
    
    # Get SHAP values for this prediction
    shap_vals, _ = model.explain_prediction(X)
    
    return PredictionOutput(
        horizon=horizon,
        predicted_temp=float(pred[0]),
        lower_bound=float(lower[0]),
        upper_bound=float(upper[0]),
        feature_importance=importance,
        shap_values=shap_vals[0].tolist() if shap_vals is not None else None
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": list(models.keys())}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
