# routes.py
from flask import Blueprint, jsonify
from chart import generate_candlestick_chart

# Create a blueprint for API routes
api = Blueprint('api', __name__)

@api.route('/candlestick', methods=['GET'])
def candlestick():
    graph_html = generate_candlestick_chart()
    return jsonify({'graph_html': graph_html})
