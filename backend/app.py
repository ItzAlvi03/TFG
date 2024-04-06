#region Libraries imports
from flask import Flask, request
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from services.db_services import users, clients
from models.database import dbClients, dbUsers
#endregion

#region settings
app = Flask(__name__)
CORS(app)

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
    data = request.json
    username = data['nombre']
    password = data['contraseña']

    response = users.login(dbUsers, username, password)
    return response

#Start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5555, debug=True)