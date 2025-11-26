# Reservoir Outflow Temperature Prediction - Backend

Interpretable ML model for predicting reservoir outflow water temperature using hydrometeorological features.

## Features

- **Multiple Forecast Horizons**: 1, 3, and 7-day predictions
- **Interpretable Models**: GAM, Gradient Boosting, Random Forest
- **Uncertainty Quantification**: Calibrated prediction intervals
- **SHAP Explanations**: Feature importance and contribution analysis
- **Real-time API**: FastAPI endpoint for predictions
- **Data Pipeline**: Automated fetching from USGS NWIS and Daymet

## Installation

```bash
pip install -r requirements.txt
```

## Quick Start

### 1. Train a Model

```bash
python train.py --site-no 01646500 --lat 38.9 --lon -77.1 --horizon 1 --model-type gbm
```

Parameters:
- `--site-no`: USGS site number for reservoir
- `--lat`, `--lon`: Coordinates for Daymet meteorology
- `--horizon`: Forecast horizon (1, 3, or 7 days)
- `--model-type`: Model type (gam, gbm, or rf)

### 2. Run the API

```bash
python api/predict.py
```

The API will be available at `http://localhost:8000`

### 3. Make Predictions

```bash
curl -X POST "http://localhost:8000/predict/1" \
  -H "Content-Type: application/json" \
  -d '{
    "t_out_current": 15.2,
    "t_in_current": 16.8,
    "discharge": 850.0,
    "inflow": 920.0,
    "storage": 125000.0,
    "release_rate": 850.0,
    "air_temp": 22.5,
    "solar_rad": 250.0,
    "wind_speed": 3.2,
    "humidity": 65.0,
    "date": "2025-01-15"
  }'
```

## Model Architecture

### Feature Engineering
- **Temporal**: Harmonic seasonality (sin/cos of day-of-year)
- **Lagged Variables**: T_out, T_in, discharge (1 and 7 days)
- **Hydrology**: Storage, release rate, inflow
- **Meteorology**: Air temp, solar radiation, wind, humidity
- **Interactions**: Temperature/discharge ratio, stratification index

### Supported Models

1. **GAM (Generalized Additive Model)**
   - Most interpretable with smooth partial dependence plots
   - Best for understanding individual feature effects

2. **GBM (Gradient Boosting Machine)**
   - Balance of accuracy and interpretability
   - SHAP values for feature attribution

3. **Random Forest**
   - Robust to outliers
   - Natural handling of interactions

## Data Sources

- **USGS NWIS**: Water temperature and discharge
  - https://waterdata.usgs.gov/nwis
- **Daymet**: Daily meteorology (1980-present)
  - https://daymet.ornl.gov/

## Project Structure

```
├── models/
│   ├── reservoir_model.py      # Main model class
│   └── saved/                  # Trained model files
├── data/
│   └── fetch_data.py           # Data fetching utilities
├── api/
│   └── predict.py              # FastAPI prediction endpoint
├── train.py                    # Training script
├── requirements.txt            # Dependencies
└── README.md
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

### Endpoints

- `POST /predict/{horizon}`: Generate temperature prediction
- `GET /health`: Check API health status

## Model Performance

Typical performance metrics (site-dependent):
- **1-day horizon**: MAE ~ 0.5-1.0°C, R² ~ 0.85-0.95
- **3-day horizon**: MAE ~ 0.8-1.5°C, R² ~ 0.75-0.90
- **7-day horizon**: MAE ~ 1.2-2.0°C, R² ~ 0.65-0.85

## Interpretability

The system provides multiple levels of explanation:
1. **Feature Importance**: Global importance rankings
2. **Partial Dependence**: How features affect predictions
3. **SHAP Values**: Individual prediction explanations
4. **Uncertainty Intervals**: 95% prediction intervals

## Citation

If you use this code in research, please cite:

```
Reservoir Outflow Temperature Prediction with Interpretable ML
[Your Institution], 2025
```

## License

MIT License
