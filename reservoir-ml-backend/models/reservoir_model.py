"""
Reservoir Outflow Temperature Prediction Model
Interpretable ML implementation using GAM, GBM, and RF
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit
from pygam import GAM, s, te
import shap
import joblib
from datetime import datetime, timedelta


class ReservoirTemperatureModel:
    """
    Interpretable ML model for reservoir outflow temperature prediction.
    Supports multiple horizons (1, 3, 7 days) with uncertainty quantification.
    """
    
    def __init__(self, horizon=1, model_type='gbm'):
        """
        Args:
            horizon: Forecast horizon in days (1, 3, or 7)
            model_type: 'gam', 'gbm', or 'rf'
        """
        self.horizon = horizon
        self.model_type = model_type
        self.scaler = StandardScaler()
        self.model = None
        self.feature_names = None
        
    def create_features(self, df):
        """Create domain-aware features from raw data"""
        features = pd.DataFrame()
        
        # Temporal features (harmonic seasonality)
        doy = df.index.dayofyear
        features['sin_doy'] = np.sin(2 * np.pi * doy / 365.25)
        features['cos_doy'] = np.cos(2 * np.pi * doy / 365.25)
        
        # Lagged temperatures
        features['t_out_lag1'] = df['t_out'].shift(1)
        features['t_out_lag7'] = df['t_out'].shift(7)
        features['t_in_lag1'] = df['t_in'].shift(1)
        
        # Lagged hydrology
        features['discharge_lag1'] = df['discharge'].shift(1)
        features['inflow_lag1'] = df['inflow'].shift(1)
        features['storage'] = df['storage']
        features['release_rate'] = df['release_rate']
        
        # Meteorology
        features['air_temp'] = df['air_temp']
        features['solar_rad'] = df['solar_rad']
        features['wind_speed'] = df['wind_speed']
        features['humidity'] = df['humidity']
        
        # Rolling statistics
        features['t_out_ma7'] = df['t_out'].rolling(7).mean()
        features['discharge_ma7'] = df['discharge'].rolling(7).mean()
        
        # Interactions
        features['temp_discharge_ratio'] = features['t_out_lag1'] / (features['discharge_lag1'] + 1)
        features['stratification_index'] = features['air_temp'] - features['t_out_lag1']
        
        return features
    
    def train(self, X_train, y_train):
        """Train the selected model"""
        X_scaled = self.scaler.fit_transform(X_train)
        self.feature_names = X_train.columns.tolist()
        
        if self.model_type == 'gam':
            # Generalized Additive Model (most interpretable)
            self.model = GAM(s(0) + s(1) + s(2) + s(3) + s(4) + s(5) + 
                           s(6) + s(7) + s(8) + s(9) + s(10))
            self.model.fit(X_scaled, y_train)
            
        elif self.model_type == 'gbm':
            # Gradient Boosting (balance of accuracy and interpretability)
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.1,
                subsample=0.8,
                random_state=42
            )
            self.model.fit(X_scaled, y_train)
            
        elif self.model_type == 'rf':
            # Random Forest
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=10,
                random_state=42
            )
            self.model.fit(X_scaled, y_train)
    
    def predict(self, X, return_uncertainty=True):
        """Generate predictions with uncertainty estimates"""
        X_scaled = self.scaler.transform(X)
        
        if self.model_type == 'gam':
            pred = self.model.predict(X_scaled)
            if return_uncertainty:
                # GAM provides prediction intervals
                intervals = self.model.prediction_intervals(X_scaled, width=0.95)
                return pred, intervals[:, 0], intervals[:, 1]
        else:
            pred = self.model.predict(X_scaled)
            if return_uncertainty and self.model_type in ['gbm', 'rf']:
                # Quantile regression or ensemble std for uncertainty
                std = np.std([tree.predict(X_scaled) for tree in self.model.estimators_], axis=0)
                lower = pred - 1.96 * std
                upper = pred + 1.96 * std
                return pred, lower, upper
        
        return pred
    
    def explain_prediction(self, X):
        """Generate SHAP values for interpretability"""
        X_scaled = self.scaler.transform(X)
        
        if self.model_type in ['gbm', 'rf']:
            explainer = shap.TreeExplainer(self.model)
            shap_values = explainer.shap_values(X_scaled)
            return shap_values, self.feature_names
        elif self.model_type == 'gam':
            # Return partial dependence from GAM
            return self.model.partial_dependence(X_scaled), self.feature_names
    
    def get_feature_importance(self):
        """Return feature importance scores"""
        if self.model_type in ['gbm', 'rf']:
            importance = self.model.feature_importances_
            return dict(zip(self.feature_names, importance))
        elif self.model_type == 'gam':
            # Return p-values or feature significance from GAM
            return {feat: self.model.statistics_['p_values'][i] 
                   for i, feat in enumerate(self.feature_names)}
    
    def save(self, filepath):
        """Save trained model"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'horizon': self.horizon,
            'model_type': self.model_type
        }, filepath)
    
    @classmethod
    def load(cls, filepath):
        """Load trained model"""
        data = joblib.load(filepath)
        instance = cls(horizon=data['horizon'], model_type=data['model_type'])
        instance.model = data['model']
        instance.scaler = data['scaler']
        instance.feature_names = data['feature_names']
        return instance
