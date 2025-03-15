import pandas as pd
import plotly.graph_objects as go
import datetime



def generate_candlestick_chart(date_from, date_to):
    """
    Generates a candlestick chart for Nifty-50 data within the specified date range.
    
    Parameters:
        date_from (str or datetime.datetime): Start date in "YYYY-MM-DD" format or a datetime object.
        date_to (str or datetime.datetime): End date in "YYYY-MM-DD" format or a datetime object.
        
    Returns:
        dict: A dictionary containing the Plotly candlestick chart's data and layout.
    """
    # Convert date_from and date_to to datetime objects if provided as strings.
    if isinstance(date_from, str):
        date_from = datetime.datetime.strptime(date_from, '%Y-%m-%d')
    if isinstance(date_to, str):
        date_to = datetime.datetime.strptime(date_to, '%Y-%m-%d')
    
    # Load the CSV file containing all companies' data
    df = pd.read_csv('stock_data/NIFTY50_all.csv', parse_dates=['Date'])
    
    # Group by Date and compute average Open, High, Low, Close across all rows
    df_avg = df.groupby('Date', as_index=False).agg({
        'Open': 'mean',
        'High': 'mean',
        'Low': 'mean',
        'Close': 'mean'
    })

    # Sort by Date
    df_avg.sort_values('Date', inplace=True)

    # Filter data by the given date range
    mask = (df_avg['Date'] >= date_from) & (df_avg['Date'] <= date_to)
    df_avg = df_avg.loc[mask]

    # Create a candlestick chart using Plotly
    fig = go.Figure(data=[go.Candlestick(
        x=df_avg['Date'],
        open=df_avg['Open'],
        high=df_avg['High'],
        low=df_avg['Low'],
        close=df_avg['Close'],
        increasing_line_color='green',
        decreasing_line_color='red'
    )])

    # Customize layout
    fig.update_layout(
        title='Nifty-50 Average - Candlestick Chart (Simple Mean of All Constituents)',
        xaxis_title='Date',
        yaxis_title='Price (INR)',
        xaxis_rangeslider_visible=False
    )

    # Return the Plotly figure as a dictionary
    fig.show()
    return fig.to_dict()
    fig.show();

generate_candlestick_chart("2012-09-21","2021-01-01");