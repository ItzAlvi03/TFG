from flask import jsonify
import sqlite3
import services.excel as excel

# Search the ClienteID of the client data
def get_clientid(dbClients, client_name, client_email, client_type):
    connection = sqlite3.connect(dbClients)
    cursor = connection.cursor()
    cursor.execute("""
        SELECT ClienteID FROM Clientes 
        WHERE Nombre = ? AND Email = ? AND Tipo = ?
    """, (client_name, client_email, client_type))
    return cursor.fetchone()[0]

#Method to insert new clients
def insert_client(dbClients, client):
    if client_exists(dbClients, client):
        return "client_exists"
    else:
        try:
            connection = sqlite3.connect(dbClients)
            cursor = connection.cursor()
            insert_sql = """
                INSERT INTO Clientes (Nombre, Email, CIF, Direccion, Tipo, Num_Cuenta_Bancaria)
                VALUES (?, ?, ?, ?, ?, ?)
            """
            cursor.execute(insert_sql, client)
            connection.commit()
            return "client_inserted"
        except sqlite3.Error:
            return "insert_error"
    
#Method to see all clients with a specific name
def search_all_clients(dbClients, name, client_type):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        check_sql = 'SELECT Nombre, Email, Tipo FROM Clientes WHERE Nombre LIKE "%' + name + '%" AND Tipo LIKE "' + client_type + '"'
        cursor.execute(check_sql)
        return cursor.fetchall()
    except sqlite3.Error:
        return None
    
#Method to see all products with a specific client_type
def search_all_products(dbClients, client_type):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        check_sql = 'SELECT Nombre, Embalaje, Precio FROM Productos WHERE Consumidor LIKE "' + client_type + '"'
        cursor.execute(check_sql)
        return cursor.fetchall()
    except sqlite3.Error:
        return None
    
#Method to see if the client exists
def client_exists(dbClients, client):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        check_sql = "SELECT COUNT(*) FROM Clientes WHERE Nombre = ? OR Email = ? OR CIF = ? OR Num_Cuenta_Bancaria = ?"
        cursor.execute(check_sql, (client[0], client[1], client[2], client[5]))
        return cursor.fetchone()[0] > 0
    except sqlite3.Error:
        return False
    
# Insert a new order to the client     
def insert_order(dbClients, client, format_time, products):
    try:
        client_id = get_clientid(dbClients, client['name'], client['email'], client['type'])
        # Search if there is any order of this client with the same date
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT PedidoID FROM Pedidos 
            WHERE ClienteID = ? AND Fecha = ? AND Estado = ?
        """, (client_id, format_time, "Pendiente"))
        order_id = cursor.fetchone()
        # If an order exists then dont create a new one just update it
        if order_id is not None:
            return update_order(dbClients, order_id[0], products, client_id)
        else:
            # Insert the order
            insert_sql = "INSERT INTO Pedidos (ClienteID, Estado, Fecha) VALUES(?,?,?)"
            cursor.execute(insert_sql, (client_id, "Pendiente", format_time))
            connection.commit()
            return cursor.lastrowid, client_id
    except sqlite3.Error:
        return None, None
    
# Insert all the products that are associated to the order    
def insert_order_details(dbClients, order_id, products):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        # Execute all insert querys
        for product in products:
            productid_sql = "SELECT ProductoID FROM Productos WHERE Nombre LIKE '" + product['name'] + "' AND Embalaje LIKE '" + product['packaging'] + "' AND Consumidor LIKE '" + product['type'] + "'"
            cursor.execute(productid_sql)
            product_id = cursor.fetchone()[0]
            insert_sql = "INSERT INTO DetallesPedidos (PedidoID, ProductoID, Cantidad) VALUES(?,?,?);"
            cursor.execute(insert_sql, (order_id, product_id, product['quantity']))
            connection.commit()

        return cursor.lastrowid
    except sqlite3.Error:
        return None
    
# Create the invoice of the order    
def insert_bill(dbClients, order_id, client_id, format_time, products):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        final_products = []
        for product in products:
            # Get the price and discounts about the product
            cursor.execute("""
                SELECT p.Precio, COALESCE(r.Descuento, 0) AS Descuento
                FROM Productos p LEFT JOIN Rebajas r
                ON p.ProductoID = r.ProductoID AND r.ClienteID = ?
                WHERE p.Nombre = ? AND p.Embalaje = ? AND p.Consumidor = ?;
                """, (client_id, product['name'], product['packaging'], product['type']))
            data = cursor.fetchone()
            price = data[0]
            discount = data[1]

            product_dict = {
                "name": product['name'],
                "packaging": product['packaging'],
                "quantity": product['quantity'],
                "price": price,
                "discount": discount
            }
            final_products.append(product_dict)

        cursor.execute("""
                SELECT c.Nombre, c.Email, c.CIF, c.Direccion, c.Tipo
                FROM Clientes c
                WHERE c.ClienteID = ?
                """, (client_id,))
        data = cursor.fetchone()
        client = {
            "name": data[0],
            "email": data[1],
            "cif": data[2],
            "address": data[3],
            "type": data[4]
        }
        total = excel.create_invoice(client, format_time, final_products, order_id)
        # Insert the bill of the order
        insert_sql = "INSERT INTO Facturas (PedidoID, Total, Fecha) VALUES(?,?,?)"
        cursor.execute(insert_sql, (order_id, total, format_time))
        connection.commit()
        return cursor.lastrowid
    except sqlite3.Error:
        return None
    
# Update an order that exists with type "Pendiente" instead of create a new one    
def update_order(dbClients, order_id, new_products, client_id):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        # Get the products that were insert on the order
        cursor.execute("""
            SELECT p.Nombre, p.Embalaje, p.Consumidor, d.Cantidad, p.Precio
            FROM Productos p
            LEFT JOIN DetallesPedidos d ON p.ProductoID = d.ProductoID
            WHERE d.PedidoID = ?;
        """, (order_id,))
        existing_products = cursor.fetchall()
        products = []
        for product in existing_products:
            product_dict = {
                "name": product[0],
                "packaging": product[1],
                "type": product[2],
                "quantity": product[3],
                "price": product[4]
            }
            products.append(product_dict)

        products.extend(new_products)

        combined_products = {}
        for product in products:
            key = (product['name'], product['packaging'])
            if key in combined_products:
                combined_products[key]['quantity'] += product['quantity']
            else:
                combined_products[key] = product

        # Get the final products to update the invoice
        final_products = []
        for product in combined_products.values():
            print(product)
            cursor.execute("""
                SELECT p.ProductoID, COALESCE(r.Descuento, 0) AS Descuento
                FROM Productos p LEFT JOIN Rebajas r
                ON p.ProductoID = r.ProductoID AND r.ClienteID = ?
                WHERE p.Nombre = ? AND p.Embalaje = ? AND p.Consumidor = ?;
                """, (client_id, product['name'], product['packaging'], product['type']))
            data = cursor.fetchone()
            product_id = data[0]
            discount = data[1]

            # Search if the product is already on the order details
            cursor.execute("""
                SELECT ProductoID FROM DetallesPedidos 
                WHERE PedidoID = ? AND ProductoID = ?
            """, (order_id, product_id))

            # If the product is already on the details just sum the count of the product quantity
            if cursor.fetchone() is not None:
                cursor.execute("""
                UPDATE DetallesPedidos
                SET Cantidad = ?
                WHERE PedidoID = ? AND ProductoID = ?
                """, (product['quantity'], order_id, product_id))
                connection.commit()
            else:
                insert_sql = "INSERT INTO DetallesPedidos (PedidoID, ProductoID, Cantidad) VALUES(?,?,?);"
                cursor.execute(insert_sql, (order_id, product_id, product['quantity']))
                connection.commit()

            # Get the price of the product
            cursor.execute("""
                SELECT Precio 
                FROM Productos 
                WHERE ProductoID = ?
                """, (product_id,))
            price = cursor.fetchone()[0]

            product_dict = {
                "name": product['name'],
                "packaging": product['packaging'],
                "quantity": product['quantity'],
                "price": price,
                "discount": discount
            }
            final_products.append(product_dict)

        # Update the invoice with the new total amount to pay
        cursor.execute("""
            SELECT c.Nombre, c.Email, c.CIF, c.Direccion, c.Tipo, f.Fecha
            FROM Clientes c, Facturas f
            WHERE c.ClienteID = ? AND f.PedidoID = ?
            """, (client_id, order_id))
        data = cursor.fetchone()
        client = {
            "name": data[0],
            "email": data[1],
            "cif": data[2],
            "address": data[3],
            "type": data[4]
        }
        date = data[5]
        
        total = excel.create_invoice(client, date, final_products, order_id)
        cursor.execute("""
            UPDATE Facturas
            SET Total = ?
            WHERE PedidoID = ?
            """, (total, order_id))
        connection.commit()

        return "Actualizado", None
    except sqlite3.Error:
        return None

# Return all the invoices with a specific type("Pendiente" or "Pagado")
def get_invoices(dbClients, client_name, client_email, client_type, order_type):
    try:
        client_id = get_clientid(dbClients, client_name, client_email, client_type)
        
        if client_id is None:
            return jsonify({"error": "No se encontró un cliente con esos datos"}), 400

        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT PedidoID FROM Pedidos 
            WHERE ClienteID = ? AND Estado = ?
        """, (client_id, order_type))
        orders = cursor.fetchall()
        
        if not orders:
            return jsonify({"error": f"No hay facturas {order_type} para este cliente."}), 400
        
        order_ids = [order[0] for order in orders]
        cursor.execute(f"""
            SELECT ROUND(Total, 2), Fecha, FacturaID FROM Facturas 
            WHERE PedidoID IN ({','.join(['?']*len(order_ids))})
        """, order_ids)
        invoices = cursor.fetchall()
        
        if not invoices:
            return jsonify({"error": f"No existen facturas en estado '{order_type}' de este cliente"})
        
        final_result = []
        for invoice in invoices:
            invoice_dict = {
                "total": invoice[0],
                "date": str(invoice[1]),
                "type": order_type,
                "id": invoice[2]
            }
            final_result.append(invoice_dict)
        
        return jsonify({"invoices": final_result})
    
    except sqlite3.Error:
        return jsonify({"error": "Error al conectar con la base de datos."}), 400

# Change the invoices types(from "Pendiente" to "Pagado" and reverse)
def change_invoices_types(dbClients, date, invoice_type, new_invoice_type, client_name, client_email, client_type):
    try:
        client_id = get_clientid(dbClients, client_name, client_email, client_type)

        if client_id is None:
            return jsonify({"error": "No se ha podido encontrar al cliente."}), 400
        
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE Pedidos
            SET Estado = ?
            WHERE ClienteID = ? AND Estado = ? AND Fecha = ?
        """, (new_invoice_type, client_id, invoice_type, date))

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "No se encontró la factura para actualizar."}), 400

        return jsonify({"message": "Factura actualizada correctamente"}), 200
    
    except sqlite3.Error:
        return jsonify({"error": "Error al actualizar la factura."}), 400
    
# Return all the products that has a discount associated to a client    
def get_discount_products(dbClients, client_name, client_email, client_type):
    client_id = get_clientid(dbClients, client_name, client_email, client_type)

    if client_id is None:
            return jsonify({"error": "No se ha podido encontrar al cliente."}), 400
    
    connection = sqlite3.connect(dbClients)
    cursor = connection.cursor()
    cursor.execute("""
        SELECT p.Nombre, p.Embalaje, r.Descuento
        FROM Productos p INNER JOIN Rebajas r
        ON p.ProductoID = r.ProductoID
        WHERE p.ProductoID IN(
            SELECT ProductoID
            FROM Rebajas
            WHERE ClienteID = ?
        )
    """, (client_id,))
    products = cursor.fetchall()

    if products is None:
        return jsonify({"error": "El cliente no tiene productos con rebajas."}), 400

    final_result = []
    for product in products:
        product_dict = {
            "name": product[0],
            "packaging": product[1],
            "discount": product[2]
        }
        final_result.append(product_dict)

    return jsonify({"products": final_result})

# Add or updates discounts of a product
def add_product_discount(dbClients, client_name, client_email, client_type, product, discount):
    try:
        client_id = get_clientid(dbClients, client_name, client_email, client_type)

        if client_id is None:
                return jsonify({"error": "No se ha podido encontrar al cliente."}), 400
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        
        # Get the ProductoID from the product
        cursor.execute("""
            SELECT ProductoID
            FROM Productos
            WHERE Nombre = ? AND Embalaje = ? AND Consumidor = ?
        """, (product['name'], product['packaging'], client_type))
        product_id = cursor.fetchone()[0]

        # Find if there is a discount aplicated to the same client and product
        cursor.execute("""
            SELECT RebajaID
            FROM Rebajas
            WHERE ClienteID = ? AND ProductoID = ?
        """, (client_id, product_id))
        discount_id = cursor.fetchone()

        # If there is no discounts create a new one
        if discount_id is None:
            cursor.execute("""
            INSERT INTO Rebajas (ClienteID, ProductoID, Descuento) VALUES(?,?,?)
        """, (client_id, product_id, discount))
        else:
            # Update the discount with the new value for the discount
            cursor.execute("""
            UPDATE Rebajas SET Descuento = ? WHERE RebajaID = ?
        """, (discount, discount_id[0]))

        connection.commit()
        return jsonify({"mensaje": "Descuento agregado con exito."})
    except sqlite3.Error:
        return jsonify({"error": "Error al tratar de agregar un nuevo descuento."}), 500
    
# Delete the discount of a product for one client
def delete_discount(dbClients, client_name, client_email, client_type, product):
    try:
        client_id = get_clientid(dbClients, client_name, client_email, client_type)

        if client_id is None:
                return jsonify({"error": "No se ha podido encontrar al cliente."}), 400
        
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        
        # Get the ProductoID from the product
        cursor.execute("""
            SELECT ProductoID
            FROM Productos
            WHERE Nombre = ? AND Embalaje = ? AND Consumidor = ?
        """, (product['name'], product['packaging'], client_type))
        product_id = cursor.fetchone()[0]

        # Delete the discount from the client of the specific product
        cursor.execute("""
            DELETE FROM Rebajas WHERE ClienteID = ? AND ProductoID = ?
        """, (client_id, product_id))

        if cursor.rowcount == 0:
            return jsonify({"error": "No se ha encontrado el descuento para borrarlo."}), 400

        connection.commit()
        return jsonify({"mensaje": "El descuento se ha borrado correctamente."})
    except sqlite3.Error:
        return jsonify({"error": "Error al tratar de borrar un descuento."}), 500    
    
# Get the order_id and date from the invoice
def get_invoice_info(dbClients, invoice_id):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        
        # Get the info from Facturas by FacturaID
        cursor.execute("""
            SELECT PedidoID, Fecha
            FROM Facturas
            WHERE FacturaID = ?
        """, (invoice_id,))
        
        return cursor.fetchone()
    except sqlite3.Error:
        return None