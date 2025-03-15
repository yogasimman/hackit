import pandas as pd
import datetime

# Hardcoded inflation data (year: inflation rate in %)
inflation_dict = {
    2008: 8.4,
    2009: 10.9,
    2010: 12.0,
    2011: 8.9,
    2012: 9.3,
    2013: 10.0,
    2014: 6.6,
    2015: 4.9,
    2016: 4.5,
    2017: 3.3,
    2018: 3.9,
    2019: 3.7,
    2020: 6.2,
    2021: 5.5,
    2022: 6.8
}

def get_inflation_factor(date, base_date):
    """Calculate cumulative inflation factor from base_date to date."""
    if date <= base_date:
        return 1.0
    start_yr = base_date.year
    end_yr = date.year
    factor = 1.0
    for yr in range(start_yr, end_yr):
        infl = inflation_dict.get(yr, 0.0)
        factor *= (1 + infl / 100.0)
    return factor

def real_value(nominal, current_date, base_date):
    """Calculate inflation-adjusted value."""
    factor = get_inflation_factor(current_date, base_date)
    return nominal / factor

# Load and preprocess data once when module is imported
df = pd.read_csv('stock_data/NIFTY50_all.csv', parse_dates=['Date'])
df.sort_values('Date', inplace=True)
df_avg = df.groupby('Date', as_index=False).agg({'Close': 'mean'})

def simulate_investment(start_date_str, initial_investment):
    """
    Simulate investment growth over time.
    
    Args:
        start_date_str (str): Start date in 'YYYY-MM-DD' format.
        initial_investment (float): Initial amount invested.
    
    Returns:
        dict: Contains plot_data (list of daily values) and final_values (summary).
    
    Raises:
        ValueError: If date format is invalid or no data is available.
    """
    # Parse start date
    try:
        start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d')
    except ValueError:
        raise ValueError("Invalid start_date format. Use YYYY-MM-DD.")
    
    # Filter data from start date
    df_filtered = df_avg[df_avg['Date'] >= start_date].copy()
    if df_filtered.empty:
        raise ValueError("No data available after the specified start date.")
    
    # Calculate nominal values
    buy_price = df_filtered.iloc[0]['Close']
    shares = initial_investment / buy_price
    df_filtered['StockValue_Nominal'] = df_filtered['Close'] * shares
    df_filtered['Cash_Nominal'] = initial_investment
    
    # Calculate real (inflation-adjusted) values
    base_date = df_filtered.iloc[0]['Date']
    df_filtered['StockValue_Real'] = df_filtered.apply(
        lambda row: real_value(row['StockValue_Nominal'], row['Date'], base_date), axis=1
    )
    df_filtered['Cash_Real'] = df_filtered.apply(
        lambda row: real_value(row['Cash_Nominal'], row['Date'], base_date), axis=1
    )
    
    # Prepare plot data
    plot_data = df_filtered[['Date', 'StockValue_Nominal', 'Cash_Nominal', 
                             'StockValue_Real', 'Cash_Real']].to_dict(orient='records')
    for item in plot_data:
        item['Date'] = item['Date'].strftime('%Y-%m-%d')
    
    # Final values summary
    last_row = df_filtered.iloc[-1]
    final_values = {
        'final_date': last_row['Date'].strftime('%Y-%m-%d'),
        'stock_nominal': last_row['StockValue_Nominal'],
        'stock_real': last_row['StockValue_Real'],
        'cash_nominal': last_row['Cash_Nominal'],
        'cash_real': last_row['Cash_Real']
    }
    
    return {'plot_data': plot_data, 'final_values': final_values}

# Placeholder for additional logic
def additional_logic(param1, param2):
    """
    Placeholder for your additional logic.
    Modify this function based on your specific requirements.
    """
    pass  # Replace with your logic