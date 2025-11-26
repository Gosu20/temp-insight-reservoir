"""
Training script for reservoir temperature model
"""

import pandas as pd
import numpy as np
from models.reservoir_model import ReservoirTemperatureModel
from data.fetch_data import USGSDataFetcher, DaymetFetcher, merge_datasets
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, r2_score
from datetime import datetime, timedelta
import argparse
import json


def train_model(site_no, lat, lon, horizon=1, model_type='gbm', 
                start_date=None, end_date=None):
    """
    Train reservoir temperature prediction model
    
    Args:
        site_no: USGS site number
        lat, lon: Coordinates for Daymet
        horizon: Forecast horizon (1, 3, or 7 days)
        model_type: 'gam', 'gbm', or 'rf'
    """
    print(f"Training {model_type.upper()} model for {horizon}-day horizon...")
    
    # Set default dates if not provided
    if end_date is None:
        end_date = datetime.now()
    if start_date is None:
        start_date = end_date - timedelta(days=365*3)  # 3 years of data
    
    # Fetch data
    print("Fetching USGS data...")
    usgs = USGSDataFetcher(site_no)
    temp_data = usgs.fetch_temperature(start_date, end_date)
    discharge_data = usgs.fetch_discharge(start_date, end_date)
    
    print("Fetching Daymet data...")
    daymet = DaymetFetcher(lat, lon)
    met_data = daymet.fetch_data(start_date.year, end_date.year)
    
    # Merge datasets
    print("Merging datasets...")
    df = merge_datasets(temp_data, discharge_data, met_data)
    
    # Create features
    model = ReservoirTemperatureModel(horizon=horizon, model_type=model_type)
    X = model.create_features(df)
    y = df['t_out'].shift(-horizon)  # Target is future temperature
    
    # Remove NaN values
    mask = ~(X.isna().any(axis=1) | y.isna())
    X = X[mask]
    y = y[mask]
    
    print(f"Training on {len(X)} samples...")
    
    # Time series cross-validation
    tscv = TimeSeriesSplit(n_splits=5)
    mae_scores = []
    r2_scores = []
    
    for train_idx, test_idx in tscv.split(X):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        
        model.train(X_train, y_train)
        y_pred, _, _ = model.predict(X_test)
        
        mae_scores.append(mean_absolute_error(y_test, y_pred))
        r2_scores.append(r2_score(y_test, y_pred))
    
    print(f"Cross-validation results:")
    print(f"  MAE: {np.mean(mae_scores):.3f} ± {np.std(mae_scores):.3f} °C")
    print(f"  R²: {np.mean(r2_scores):.3f} ± {np.std(r2_scores):.3f}")
    
    # Train final model on all data
    model.train(X, y)
    
    # Save model
    model_path = f'models/saved/reservoir_{model_type}_h{horizon}.pkl'
    model.save(model_path)
    print(f"Model saved to {model_path}")
    
    # Save feature importance
    importance = model.get_feature_importance()
    with open(f'models/saved/feature_importance_h{horizon}.json', 'w') as f:
        json.dump(importance, f, indent=2)
    
    return model, {'mae': np.mean(mae_scores), 'r2': np.mean(r2_scores)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--site-no', type=str, required=True, help='USGS site number')
    parser.add_argument('--lat', type=float, required=True, help='Latitude')
    parser.add_argument('--lon', type=float, required=True, help='Longitude')
    parser.add_argument('--horizon', type=int, default=1, choices=[1, 3, 7])
    parser.add_argument('--model-type', type=str, default='gbm', choices=['gam', 'gbm', 'rf'])
    
    args = parser.parse_args()
    
    train_model(args.site_no, args.lat, args.lon, args.horizon, args.model_type)
