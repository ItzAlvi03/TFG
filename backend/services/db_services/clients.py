from flask import jsonify
import sqlite3

#   SUMMARY: Method to insert new clients
#   RETURN: True(insert succesfully), error or exists(cannot insert)
#   VALUES: dbClients(BD PATH), client(all client data)
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
        except sqlite3.Error as e:
            print(e)
            return "insert_error"
    
#   SUMMARY: Method to see all clients with a specific name
#   RETURN: client data or None
#   VALUES: dbClients(BD PATH), name(client's name), client_type(particular/empresa)
def search_all_clients(dbClients, name, client_type):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        check_sql = 'SELECT Nombre, Email, Tipo FROM Clientes WHERE Nombre LIKE "%' + name + '%" AND Tipo LIKE "' + client_type + '"'
        cursor.execute(check_sql)
        return cursor.fetchall()
    except sqlite3.Error:
        return None
    
#   SUMMARY: Method to see all products with a specific client_type
#   RETURN: product data or None
#   VALUES: dbClients(BD PATH), client_type(particular/empresa)
def search_all_products(dbClients, client_type):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        check_sql = 'SELECT Nombre, Embalaje, Precio FROM Productos WHERE Consumidor LIKE "' + client_type + '"'
        cursor.execute(check_sql)
        return cursor.fetchall()
    except sqlite3.Error:
        return None
    
#   SUMMARY: Method to see if the client exists
#   RETURN: client data or None
#   VALUES: dbClients(BD PATH), client(all client data)
def client_exists(dbClients, client):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        check_sql = "SELECT COUNT(*) FROM Clientes WHERE Nombre = ? OR Email = ? OR CIF = ? OR Num_Cuenta_Bancaria = ?"
        cursor.execute(check_sql, (client[0], client[1], client[2], client[5]))
        return cursor.fetchone()[0] > 0
    except sqlite3.Error:
        return False
    
def insert_order(dbClients, client, format_time):
    try:
        connection = sqlite3.connect(dbClients)
        cursor = connection.cursor()
        # Get id from client
        clientid_sql = "SELECT ClienteID FROM Clientes WHERE Nombre LIKE '" + client['name'] + "' AND Email LIKE '" + client['email'] + "'"
        cursor.execute(clientid_sql)
        client_id = cursor.fetchone()[0]
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