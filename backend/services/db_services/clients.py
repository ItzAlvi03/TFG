from flask import jsonify
import sqlite3

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
            return update_order(dbClients, order_id[0], products)
        else:
            # Insert the order
            insert_sql = "INSERT INTO Pedidos (ClienteID, Estado, Fecha) VALUES(?,?,?)"
            cursor.execute(insert_sql, (client_id, "Pendiente", format_time))
            connection.commit()
            return cursor.lastrowid
    except sqlite3.Error:
        return None
    
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
    
def insert_bill(dbClients, order_id, total_price, format_time):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        # Insert the bill of the order
        insert_sql = "INSERT INTO Facturas (PedidoID, Total, Fecha) VALUES(?,?,?)"
        cursor.execute(insert_sql, (order_id, total_price, format_time))
        connection.commit()
        return cursor.lastrowid
    except sqlite3.Error:
        return None
    
def update_order(dbClients, order_id, products):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        for product in products:
            productid_sql = "SELECT ProductoID FROM Productos WHERE Nombre LIKE '" + product['name'] + "' AND Embalaje LIKE '" + product['packaging'] + "' AND Consumidor LIKE '" + product['type'] + "'"
            cursor.execute(productid_sql)
            product_id = cursor.fetchone()[0]

            # Search if the product is already on the order details
            cursor.execute("""
                SELECT ProductoID FROM DetallesPedidos 
                WHERE PedidoID = ? AND ProductoID = ?
            """, (order_id, product_id))

            # If the product is already on the details just sum the count of the product quantity
            if cursor.fetchone() is not None:
                cursor.execute("""
                UPDATE DetallesPedidos
                SET Cantidad = Cantidad + ?
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
            
            # Update the invoice with the new total amount to pay
            total = price * product['quantity']
            cursor.execute("""
                UPDATE Facturas
                SET Total = Total + ?
                WHERE PedidoID = ?
                """, (total, order_id))
            connection.commit()

        return "Actualizado"
    except sqlite3.Error:
        return None

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
            SELECT ROUND(Total, 2), Fecha FROM Facturas 
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
                "type": order_type
            }
            final_result.append(invoice_dict)
        
        return jsonify({"invoices": final_result})
    
    except sqlite3.Error:
        return jsonify({"error": "Error al conectar con la base de datos."}), 400
    
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