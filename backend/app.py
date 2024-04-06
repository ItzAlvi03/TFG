#region Libraries imports
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import jwt
from services.db_services import users, clients
from models.database import dbClients, dbUsers
import services.generate_token as token_generator
from functools import wraps
#endregion

#region settings
app = Flask(__name__)
app.config['SECRET_KEY'] = 'abe0ec61f6ca4091b1cee27ba20259eb'
CORS(app)

def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = request.json['token']

        if not token:
            return jsonify({'mensaje': 'Falta el token.'}), 400

        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            return func(payload, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'mensaje': 'El token ha caducado.'}), 400
        except jwt.InvalidTokenError:
            return jsonify({'mensaje': 'El token es inválido.'}), 400

    return decorated

#region get info from config.json
# with open ("src/config.json", "r") as config_file:
#     config = json.load(config_file)
#endregion

#region Swagger config
# SWAGGER_URL = config['swagger']
# API_URL = config['local_api_swagger']
# swaggerui_blueprint = get_swaggerui_blueprint(
#     SWAGGER_URL,
#     API_URL,
#     config={
#         'app.name': "Dulces Trinidad API"
#     }
# )
# app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
#endregion

#endregion

#region API endpoints

# @app.route('/swagger.json')
# def index():
#     with open('swagger.json', 'r') as f:
#         return jsonify(json.load(f))
    
#   SUMMARY: Endpoint to see if exists users in users.db
#   RETURN: response 200(with the user) or response 500 (empty with no user)
#   POST /userLogin
#   VALUES: data(user info)
@app.route('/userLogin', methods=['POST'])
def user_login():
    try:
        data = request.json
        username = data['username']
        password = data['password']

        result = users.login(dbUsers, username, password)
        if result is not None:
            token = token_generator.generate(app.config['SECRET_KEY'], username, result)
            return jsonify({"token": token})
        else:
            return jsonify({'mensaje': 'No se ha encontrado un usuario con esas credenciales.'}), 400
        
    except Exception as e:
        return jsonify({'mensaje': f'Error al buscar usuario: {e}'}), 500
    
@app.route('/auth', methods=['POST'])
@token_required
def authenticator(payload):
    return jsonify({
        "username": payload.get('username'),
        "id": payload.get('id'),
        "rol": payload.get('rol')
    })
#Start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5555, debug=True)