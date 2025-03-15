
# app.py (Main Flask Application)
from flask import Flask
from flask_cors import CORS
from routes import api  # Import the blueprint

app = Flask(__name__)
CORS(app) 
app.register_blueprint(api, url_prefix='/api')
@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    API endpoint to simulate investment.
    
    Expects JSON payload:
    {
        "start_date": "YYYY-MM-DD",
        "initial_investment": number
    }
    
    Returns:
        JSON response with simulation results or error message.
    """
    data = request.get_json()
    if not data or 'start_date' not in data or 'initial_investment' not in data:
        return jsonify({'error': 'Missing start_date or initial_investment'}), 400
    
    start_date_str = data['start_date']
    try:
        initial_investment = float(data['initial_investment'])
    except ValueError:
        return jsonify({'error': 'initial_investment must be a number'}), 400
    
    try:
        result = simulate_investment(start_date_str, initial_investment)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
