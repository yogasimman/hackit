from flask import Blueprint, jsonify, request
from flask_cors import CORS
from chart import generate_candlestick_chart

api = Blueprint('api', __name__)

@api.route('/candlestick', methods=['POST'])
def candlestick():
    try:
        data = request.get_json()
        if not data or 'date_from' not in data or 'date_to' not in data:
            return jsonify({'error': 'Missing date parameters'}), 400
        
        fig_dict = generate_candlestick_chart(data['date_from'], data['date_to'])
        if 'error' in fig_dict:
            return jsonify(fig_dict), 404
        
        return jsonify(fig_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 500