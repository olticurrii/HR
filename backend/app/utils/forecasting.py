"""
Forecasting utility for time series prediction
Implements simple moving average and exponential smoothing
"""
from typing import List, Dict, Tuple, Optional
from datetime import date, timedelta
import statistics


def moving_average(values: List[float], window: int = 7) -> List[float]:
    """
    Calculate moving average with specified window
    
    Args:
        values: Time series values
        window: Window size for averaging
    
    Returns:
        List of moving averages
    """
    if len(values) < window:
        return values
    
    ma = []
    for i in range(len(values)):
        if i < window - 1:
            # Not enough data yet, use what we have
            ma.append(statistics.mean(values[:i+1]))
        else:
            # Use full window
            ma.append(statistics.mean(values[i-window+1:i+1]))
    
    return ma


def exponential_smoothing(
    values: List[float],
    alpha: float = 0.3
) -> List[float]:
    """
    Apply exponential smoothing to time series
    
    Args:
        values: Time series values
        alpha: Smoothing factor (0 < alpha < 1)
            Lower alpha = more smoothing
            Higher alpha = more responsive to recent values
    
    Returns:
        Smoothed values
    """
    if not values:
        return []
    
    smoothed = [values[0]]  # First value stays the same
    
    for i in range(1, len(values)):
        # S_t = alpha * Y_t + (1 - alpha) * S_{t-1}
        next_val = alpha * values[i] + (1 - alpha) * smoothed[-1]
        smoothed.append(next_val)
    
    return smoothed


def forecast_next_n_values(
    values: List[float],
    n: int = 4,
    method: str = "exponential",
    alpha: float = 0.3
) -> List[float]:
    """
    Forecast next N values using exponential smoothing or moving average
    
    Args:
        values: Historical time series values
        n: Number of future values to forecast
        method: 'exponential' or 'moving_average'
        alpha: Smoothing factor for exponential method
    
    Returns:
        List of N forecasted values
    """
    if not values:
        return [0.0] * n
    
    if len(values) < 3:
        # Not enough data, return last value
        return [values[-1]] * n
    
    if method == "exponential":
        # Apply exponential smoothing to existing data
        smoothed = exponential_smoothing(values, alpha)
        last_smoothed = smoothed[-1]
        
        # Calculate trend from last few values
        if len(smoothed) >= 3:
            recent_trend = (smoothed[-1] - smoothed[-3]) / 2
        else:
            recent_trend = 0
        
        # Forecast next N values with trend
        forecasts = []
        for i in range(1, n + 1):
            forecast_val = last_smoothed + (recent_trend * i)
            # Ensure non-negative for counts
            forecast_val = max(0, forecast_val)
            forecasts.append(forecast_val)
        
        return forecasts
    
    else:  # moving_average
        # Use last 7 values for average
        window = min(7, len(values))
        avg = statistics.mean(values[-window:])
        
        # Simple projection: repeat average
        return [avg] * n


def calculate_confidence_interval(
    values: List[float],
    confidence: float = 0.95
) -> Tuple[float, float]:
    """
    Calculate confidence interval for forecast
    
    Args:
        values: Historical values
        confidence: Confidence level (e.g., 0.95 for 95%)
    
    Returns:
        Tuple of (lower_bound, upper_bound) as percentage of mean
    """
    if not values or len(values) < 2:
        return (0.0, 0.0)
    
    mean = statistics.mean(values)
    
    try:
        stdev = statistics.stdev(values)
        # Simple approximation: ~2 std devs for 95% CI
        z_score = 1.96 if confidence >= 0.95 else 1.645
        margin = z_score * stdev
        
        lower = max(0, mean - margin)
        upper = mean + margin
        
        return (lower, upper)
    except statistics.StatisticsError:
        # Not enough variance
        return (mean, mean)


def forecast_with_confidence(
    dates: List[date],
    values: List[float],
    forecast_weeks: int = 4,
    method: str = "exponential"
) -> Dict:
    """
    Generate forecast with confidence intervals
    
    Args:
        dates: List of dates for historical data
        values: List of values corresponding to dates
        forecast_weeks: Number of weeks to forecast
        method: Forecasting method
    
    Returns:
        Dict with historical data, forecast, and confidence intervals
    """
    if not dates or not values or len(dates) != len(values):
        return {
            "historical": [],
            "forecast": [],
            "confidence_lower": [],
            "confidence_upper": []
        }
    
    # Calculate confidence interval from historical data
    lower_pct, upper_pct = calculate_confidence_interval(values)
    
    # Generate forecast
    forecast_vals = forecast_next_n_values(values, forecast_weeks * 7, method)
    
    # Generate future dates (weekly intervals for simplicity)
    last_date = dates[-1]
    forecast_dates = [last_date + timedelta(weeks=i+1) for i in range(forecast_weeks)]
    
    # Aggregate forecast to weekly (average every 7 days)
    weekly_forecast = []
    for i in range(forecast_weeks):
        week_vals = forecast_vals[i*7:(i+1)*7]
        weekly_forecast.append(statistics.mean(week_vals) if week_vals else 0)
    
    # Calculate CI for each forecast point
    ci_lower = []
    ci_upper = []
    
    for forecast_val in weekly_forecast:
        if forecast_val > 0:
            # Use historical variance to estimate CI
            variance_pct = (upper_pct - lower_pct) / (2 * statistics.mean(values)) if statistics.mean(values) > 0 else 0.2
            margin = forecast_val * variance_pct
            ci_lower.append(max(0, forecast_val - margin))
            ci_upper.append(forecast_val + margin)
        else:
            ci_lower.append(0)
            ci_upper.append(0)
    
    # Prepare output
    historical = [
        {"date": str(d), "value": v}
        for d, v in zip(dates, values)
    ]
    
    forecast = [
        {
            "date": str(d),
            "value": v,
            "lower": l,
            "upper": u
        }
        for d, v, l, u in zip(forecast_dates, weekly_forecast, ci_lower, ci_upper)
    ]
    
    return {
        "historical": historical,
        "forecast": forecast,
        "method": method,
        "confidence_level": 0.95
    }


def simple_trend_analysis(values: List[float]) -> Dict[str, float]:
    """
    Calculate simple trend metrics
    
    Returns:
        Dict with trend direction, slope, and change percentage
    """
    if not values or len(values) < 2:
        return {
            "direction": "stable",
            "slope": 0.0,
            "change_pct": 0.0
        }
    
    # Compare first half to second half
    mid = len(values) // 2
    first_half_avg = statistics.mean(values[:mid])
    second_half_avg = statistics.mean(values[mid:])
    
    if first_half_avg == 0:
        change_pct = 0.0
    else:
        change_pct = ((second_half_avg - first_half_avg) / first_half_avg) * 100
    
    # Determine direction
    if abs(change_pct) < 5:
        direction = "stable"
    elif change_pct > 0:
        direction = "increasing"
    else:
        direction = "decreasing"
    
    # Calculate simple slope
    slope = (second_half_avg - first_half_avg) / mid if mid > 0 else 0
    
    return {
        "direction": direction,
        "slope": round(slope, 2),
        "change_pct": round(change_pct, 2)
    }

