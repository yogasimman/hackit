# chart.py
import pandas as pd
import plotly.graph_objects as go
import datetime

def generate_candlestick_chart():
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

    # Filter date range (adjust as needed)
    start_date = datetime.datetime(2010, 1, 1)
    end_date   = datetime.datetime(2021, 12, 31)
    mask = (df_avg['Date'] >= start_date) & (df_avg['Date'] <= end_date)
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

    # Convert the Plotly figure to an HTML snippet
    graph_html = fig.to_html(full_html=False)
    return graph_html
