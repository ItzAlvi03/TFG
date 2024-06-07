#region Libraries imports
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import jwt
from services.db_services import users, clients
from models.database import dbClients, dbUsers
import services.generate_token as token_generator
from datetime import datetime
from functools import wraps
#endregion

#region settings
app = Flask(__name__)
app.config['SECRET_KEY'] = 'abe0ec61f6ca4091b1cee27ba20259eb'
CORS(app)

#   SUMMARY: Method to check all the tokens
#   RETURN: response 200(with the token info) or response 400 (invalid token)
#   VALUES: func(all the data from the endpoint)
def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        data = request.json
        if not data or 'token' not in data:
            return jsonify({'error': 'Falta el token.'}), 400

        token = data['token']

        if not token:
            return jsonify({'error': 'Falta el token.'}), 400

        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            return func(payload, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'El token ha caducado.'}), 400
        except jwt.InvalidTokenError:
            return jsonify({'error': 'El token es inválido.'}), 400

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
#     with open('swagger.json', 'r') as f):
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
            return jsonify({'error': 'No se ha encontrado un usuario con esas credenciales.'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Error al buscar usuario: {e}'}), 500
    
#   SUMMARY: Endpoint to see if exists users in users.db
#   RETURN: response 200(with the user) or response 500 (empty with no user)
#   POST /userLogin
#   VALUES: data(user info)
@app.route('/insertClient', methods=['POST'])
@token_required
def insert_clients(payload):
    try:
        data = request.json
        name = data['name']
        email = data['email']
        cif = data['cif']
        address = data['address']
        client_type = data['type']
        bank_account = data['bank_account']

        if not all([name, email, cif, address, client_type, bank_account]):
            return jsonify({'error': 'not_enough_data.'}), 400
        
        client = (
            name,
            email,
            cif,
            address,
            client_type,
            bank_account
        )
        result = clients.insert_client(dbClients,client)
        if result == "client_exists":
            return jsonify({"error": result}), 400
        elif result == "insert_error":
            return jsonify({"error": result}), 400
        else:
            return jsonify({"mensaje": result})
        
    except Exception as e:
        return jsonify({'error': f'Error al insertar clientes: {e}'}), 500
    
#   SUMMARY: Endpoint to see if exists clients in clients.db
#   RETURN: response 200(with the clients) or response 500 (empty with no clients)
#   POST /searchAllClients
#   VALUES: data(clients info)
@app.route('/searchAllClients', methods=['POST'])
@token_required
def search_all_clients(payload):
    try:
        data = request.json
        name = data['name']
        client_type = data['type']
        
        result = clients.search_all_clients(dbClients, name, client_type)
        if result is not None and len(result) > 0:
            final_result = []
            for client in result:
                client_dict = {
                    "name": client[0],
                    "email": client[1],
                    "type": client[2]
                }
                final_result.append(client_dict)
            return jsonify({"clients": final_result})
        else:
            return jsonify({'error': 'No se ha podido encontrar un usuario con esos datos.'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Error al buscar clientes: {e}'}), 500
    
#   SUMMARY: Endpoint to see if exists products in clients.db
#   RETURN: response 200(with the products) or response 500 (empty with no products)
#   POST /getAllProductsName
#   VALUES: product(products info)
@app.route('/getAllProducts', methods=['POST'])
@token_required
def get_all_products(payload):
    try:
        data = request.json
        client_type = data['type']
        
        result = clients.search_all_products(dbClients, client_type)
        if result is not None and len(result) > 0:
            final_result = []
            for product in result:
                product_dict = {
                    "name": product[0],
                    "packaging": product[1],
                    "price": product[2]
                }
                final_result.append(product_dict)
            return jsonify({"products": final_result})
        else:
            return jsonify({'error': 'No se ha podido encontrar un producto con esos datos.'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Error al buscar productos: {e}'}), 500
        
#   SUMMARY: Endpoint to insert orders to the clients in clients.db
#   RETURN: response 200 or response 400/500 (error)
#   POST /insertOrder
#   VALUES: products(order info)
@app.route('/insertOrder', methods=['POST'])
@token_required
def insert_order(payload):
    try:
        data = request.json
        products = data['products']
        total_price = data['total']
        client = data['client']

        if products is None or total_price is None:
            return jsonify({'error': 'Faltan datos para insertar el pedido.'}), 400
 
        now = datetime.now()
        format_time = now.strftime('%d-%m-%Y')
        order_id = clients.insert_order(dbClients, client, format_time)

        if order_id is None:
            return jsonify({'error': 'Ocurrió un error al intentar insertar un pedido.'}), 400

        result = clients.insert_order_details(dbClients, order_id, products)

        if result is None:
            return jsonify({'error': 'Ocurrió un error al intentar insertar los detalles del pedido.'}), 400
        
        result = clients.insert_bill(dbClients, order_id, total_price, format_time)

        if result is None:
            return jsonify({'error': 'Ocurrió un error al intentar insertar la factura del pedido.'}), 400
        
        return jsonify({'mensaje': "Se ha insertado todos los datos del pedido correctamente."})
        
    except Exception as e:
        return jsonify({'error': f'Error al insertar el pedido: {e}'}), 500
    
#   SUMMARY: Endpoint to check a token
#   RETURN: response 200(with info about user) or response 400 (token invalid)
#   POST /auth
#   VALUES: payload(info inside of token)
@app.route('/auth', methods=['POST'])
@token_required
def authenticator(payload):
    print(payload)
    return jsonify({
        "username": payload.get('username'),
        "rol": payload.get('rol')
    })
#endregion
#Start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5555, debug=True)