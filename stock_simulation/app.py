# app.py
from flask import Flask
from routes import api

app = Flask(__name__)
# Register the blueprint with a URL prefix (optional)
app.register_blueprint(api, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
