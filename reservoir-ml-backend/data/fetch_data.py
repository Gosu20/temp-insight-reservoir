"""
Data fetching utilities for USGS NWIS and Daymet
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
import numpy as np


class USGSDataFetcher:
    """Fetch reservoir discharge and temperature from USGS NWIS"""
    
    BASE_URL = "https://waterdata.usgs.gov/nwis/dv"
    
    def __init__(self, site_no):
        self.site_no = site_no
    
    def fetch_temperature(self, start_date, end_date):
        """Fetch water temperature data"""
        params = {
            'cb_00010': 'on',  # Water temperature
            'format': 'rdb',
            'site_no': self.site_no,
            'begin_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d')
        }
        
        response = requests.get(self.BASE_URL, params=params)
        df = self._parse_rdb(response.text)
        return df
    
    def fetch_discharge(self, start_date, end_date):
        """Fetch discharge data"""
        params = {
            'cb_00060': 'on',  # Discharge
            'format': 'rdb',
            'site_no': self.site_no,
            'begin_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d')
        }
        
        response = requests.get(self.BASE_URL, params=params)
        df = self._parse_rdb(response.text)
        return df
    
    def _parse_rdb(self, rdb_text):
        """Parse USGS RDB format"""
        lines = rdb_text.split('\n')
        # Skip comment lines
        data_start = next(i for i, line in enumerate(lines) if not line.startswith('#'))
        
        # Read into DataFrame
        from io import StringIO
        df = pd.read_csv(StringIO('\n'.join(lines[data_start:])), 
                        sep='\t', skiprows=[1])  # Skip format line
        
        df['datetime'] = pd.to_datetime(df['datetime'])
        df.set_index('datetime', inplace=True)
        return df


class DaymetFetcher:
    """Fetch meteorological data from Daymet"""
    
    BASE_URL = "https://daymet.ornl.gov/single-pixel/api/data"
    
    def __init__(self, lat, lon):
        self.lat = lat
        self.lon = lon
    
    def fetch_data(self, start_year, end_year, variables=None):
        """
        Fetch Daymet meteorological data
        
        Args:
            variables: List of variables (tmax, tmin, prcp, srad, vp, swe, dayl)
        """
        if variables is None:
            variables = ['tmax', 'tmin', 'srad', 'vp', 'dayl']
        
        params = {
            'lat': self.lat,
            'lon': self.lon,
            'vars': ','.join(variables),
            'start': start_year,
            'end': end_year,
            'format': 'json'
        }
        
        response = requests.get(self.BASE_URL, params=params)
        data = response.json()
        
        # Convert to DataFrame
        df = pd.DataFrame(data['data'])
        df['date'] = pd.to_datetime(df['year'].astype(str) + df['yday'].astype(str), 
                                    format='%Y%j')
        df.set_index('date', inplace=True)
        
        # Calculate derived variables
        df['air_temp'] = (df['tmax'] + df['tmin']) / 2
        df['solar_rad'] = df['srad']
        
        return df[['air_temp', 'solar_rad', 'vp', 'dayl']]


def merge_datasets(usgs_temp, usgs_discharge, daymet):
    """Merge USGS and Daymet data into single DataFrame"""
    df = pd.merge(usgs_temp, usgs_discharge, left_index=True, right_index=True, how='outer')
    df = pd.merge(df, daymet, left_index=True, right_index=True, how='outer')
    
    # Forward fill missing values (up to 2 days)
    df = df.fillna(method='ffill', limit=2)
    
    return df
