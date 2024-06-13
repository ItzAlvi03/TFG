#region Libraries imports
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import jwt
from services.db_services import users, clients
from models.database import dbClients, dbUsers
import services.generate_token as token_generator
from services.excel import get_invoice
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

#   SUMMARY: Method to check if user has rol "Encargado"
#   RETURN: response 200(with the token info) or response 400 (invalid token)
#   VALUES: func(all the data from the endpoint)
def encargado_rol(func):
    @wraps(func)
    def decorated(payload, *args, **kwargs):
        if 'rol' in payload and str(payload['rol']).lower() == 'encargado':
            return func(payload, *args, **kwargs)
        else:
            return jsonify({'error': 'Permiso denegado. No eres un encargado.'}), 400

    return decorated
    
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
@app.route('/createAccount', methods=['POST'])
def create_account():
    try:
        data = request.json
        username = data['username']
        password = data['password']
        rol = data['type']
        result = users.create_account(dbUsers, username, password, rol)
        if result is not None:
            return jsonify({"mensaje": "Cuenta creada con exito."})
        else:
            return jsonify({'error': 'Ya existe un usuario con ese nombre.'}), 400
        
    except Exception:
        return jsonify({'error': 'Error al crear el usuario.'}), 400
    
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
            return jsonify({'error': 'Faltan datos para insertar el cliente.'}), 400
        
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
            return jsonify({"error": "El cliente ya existe."}), 400
        elif result == "insert_error":
            return jsonify({"error": "Ocurrió un error al insertar el cliente, inténtelo de nuevo."}), 400
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
#   POST /getAllProducts
#   VALUES: product(products info)
@app.route('/getAllProducts', methods=['POST'])
@token_required
def get_all_products(payload):
    try:
        data = request.json
        client_type = data['type']
        result = []

        if client_type == "all":
            result = clients.search_all_products(dbClients)
        else:
            result = clients.search_all_products_type(dbClients, client_type)

        if result is not None and len(result) > 0:
            final_result = []
            product_dict = {}
            for product in result:
                if client_type == "all":
                    product_dict = {
                        "name": product[0],
                        "packaging": product[1],
                        "type": product[2],
                        "quantity": 1,
                        "price": product[3]
                    }
                else:
                    product_dict = {
                        "name": product[0],
                        "packaging": product[1],
                        "price": product[2]
                    }
                final_result.append(product_dict)
            return jsonify({"products": final_result})
        else:
            return jsonify({'error': 'No se ha podido encontrar productos.'}), 400
        
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
        order_id, client_id = clients.insert_order(dbClients, client, format_time, products)

        if order_id == "Actualizado":
            return jsonify({'mensaje': "Pedido actualizado con exito."})

        elif order_id is None:
            return jsonify({'error': 'Ocurrió un error al intentar insertar un pedido.'}), 400

        result = clients.insert_order_details(dbClients, order_id, products)

        if result is None:
            return jsonify({'error': 'Ocurrió un error al intentar insertar los detalles del pedido.'}), 400
        
        result = clients.insert_bill(dbClients, order_id, client_id, format_time, products)

        if result is None:
            return jsonify({'error': 'Ocurrió un error al intentar insertar la factura del pedido.'}), 400
        
        return jsonify({'mensaje': "Se ha insertado todos los datos del pedido correctamente."})
        
    except Exception as e:
        return jsonify({'error': f'Error al insertar el pedido: {e}'}), 500
           
#   SUMMARY: Endpoint to insert orders to the clients in clients.db
#   RETURN: response 200 or response 400/500 (error)
#   POST /searchClientInvoices
#   VALUES: products(order info)
@app.route('/searchClientInvoices', methods=['POST'])
@token_required
def get_all_client_invoices(payload):
    try:
        data = request.json
        client_name = data['client_name']
        client_email = data['client_email']
        client_type = data['client_type']
        order_type = data['order_type']

        return clients.get_invoices(dbClients, client_name, client_email, client_type, order_type)
    except Exception:
        return jsonify({'error': 'Error al buscar las facturas del cliente.'}), 500
               
#   SUMMARY: Endpoint to change the invoices's types in clients.db
#   RETURN: response 200 or response 400/500 (error)
#   POST /changeInvoiceType
#   VALUES: products(order info)
@app.route('/changeInvoiceType', methods=['POST'])
@token_required
@encargado_rol
def change_invoice_type(payload):
    try:
        data = request.json
        date = data['date']
        invoice_type = data['type']
        new_invoice_type = data['new_type']
        client_name = data['client_name']
        client_email = data['client_email']
        client_type = data['client_type']

        return clients.change_invoices_types(dbClients, date, invoice_type, new_invoice_type, client_name, client_email, client_type)
    except Exception:
        return jsonify({'error': 'Error al actualizar la factura.'}), 500
       
#   SUMMARY: Endpoint to get the discounts products associated to a client
#   RETURN: response 200 with products or response 400/500 (empty/error)
#   POST /getDiscountProducts
#   VALUES: client info
@app.route('/getDiscountProducts', methods=['POST'])
@token_required
def get_discount_products(payload):
    try:
        data = request.json
        client_name = data['name']
        client_email = data['email']
        client_type = data['type']

        return clients.get_discount_products(dbClients, client_name, client_email, client_type)
    except Exception:
        return jsonify({'error': 'Error al buscar productos rebajados.'}), 500
       
#   SUMMARY: Endpoint to add new discounts to clients in different products
#   RETURN: response 200 or response 400/500
#   POST /addProductDiscount
#   VALUES: data info
@app.route('/addProductDiscount', methods=['POST'])
@token_required
@encargado_rol
def add_product_discount(payload):
    try:
        data = request.json
        client_name = data['name']
        client_email = data['email']
        client_type = data['type']
        product = data['product']
        discount = data['discount']

        return clients.add_product_discount(dbClients, client_name, client_email, client_type, product, discount)
    except Exception:
        return jsonify({'error': 'Error al agregar un descuento al producto.'}), 500
       
#   SUMMARY: Endpoint to delete discounts to clients in different products
#   RETURN: response 200 or response 400/500
#   POST /deleteDiscount
#   VALUES: data info
@app.route('/deleteDiscount', methods=['POST'])
@token_required
@encargado_rol
def delete_discount(payload):
    try:
        data = request.json
        client_name = data['name']
        client_email = data['email']
        client_type = data['type']
        product = data['product']

        return clients.delete_discount(dbClients, client_name, client_email, client_type, product)
    except Exception:
        return jsonify({'error': 'Error al agregar un descuento al producto.'}), 500
        
#   SUMMARY: Endpoint to send the invoice to download
#   RETURN: response 200 or response 400/500
#   POST /downloadInvoice
#   VALUES: data info
@app.route('/downloadInvoice', methods=['POST'])
@token_required
def download_invoice(payload):
    try:
        data = request.json
        invoice_id = data['id']

        info = clients.get_invoice_info(dbClients, invoice_id)

        if info is None:
            return jsonify({"error": "No se ha podido encontrar la información de la factura."}), 400
        
        return get_invoice(info[0], info[1])
    except Exception:
        return jsonify({'error': 'Error al agregar un descuento al producto.'}), 500
       
#   SUMMARY: Endpoint to update the product's price
#   RETURN: response 200 or response 400/500
#   POST /changeProductPrice
#   VALUES: data info
@app.route('/changeProductPrice', methods=['POST'])
@token_required
@encargado_rol
def change_product_price(payload):
    try:
        data = request.json
        product = data['product']
        price = data['price']

        return clients.update_product_price(dbClients, product, price)
    except Exception:
        return jsonify({'error': 'Error al agregar un descuento al producto.'}), 500
   
#   SUMMARY: Endpoint to check a token
#   RETURN: response 200(with info about user) or response 400 (token invalid)
#   POST /auth
#   VALUES: payload(info inside of token)
@app.route('/auth', methods=['POST'])
@token_required
def authenticator(payload):
    return jsonify({
        "username": payload.get('username'),
        "rol": payload.get('rol')
    })
#endregion

#Start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5555, debug=True)