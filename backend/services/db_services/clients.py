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