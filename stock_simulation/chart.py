import pandas as pd
import plotly.graph_objects as go
import datetime
import os

def generate_candlestick_chart(date_from, date_to):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, 'stock_data', 'NIFTY50_all.csv')
    
    if isinstance(date_from, str):
        date_from = datetime.datetime.strptime(date_from, '%Y-%m-%d')
    if isinstance(date_to, str):
        date_to = datetime.datetime.strptime(date_to, '%Y-%m-%d')
    
    df = pd.read_csv(csv_path, parse_dates=['Date'], dayfirst=True)  # Adjust if date format differs
    
    df_avg = df.groupby('Date', as_index=False).agg({
        'Open': 'mean',
        'High': 'mean',
        'Low': 'mean',
        'Close': 'mean'
    })
    
    df_avg.sort_values('Date', inplace=True)
    
    mask = (df_avg['Date'] >= date_from) & (df_avg['Date'] <= date_to)
    df_avg = df_avg.loc[mask]
    
    if df_avg.empty:
        return {'error': 'No data available for the selected date range'}
    
    dates = df_avg['Date'].dt.strftime('%Y-%m-%d').tolist()
    
    fig = go.Figure(data=[go.Candlestick(
        x=dates,
        open=df_avg['Open'],
        high=df_avg['High'],
        low=df_avg['Low'],
        close=df_avg['Close'],
        increasing_line_color='green',
        decreasing_line_color='red'
    )])
    
    fig.update_layout(
        autosize=True,
        title='Nifty-50 Average - Candlestick Chart',
        xaxis=dict(title='Date', rangeslider_visible=False, type='date'),
        yaxis=dict(title='Price (INR)'),
        margin=dict(l=50, r=50, t=50, b=50)
    )
    
    return fig.to_dict()