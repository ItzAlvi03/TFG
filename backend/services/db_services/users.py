from flask import jsonify
import sqlite3

def login(dbUsers, username, password):
    try:
        connection = sqlite3.connect(dbUsers)
        cursor = connection.cursor()
        query = 'SELECT id FROM user WHERE username = ? AND password = ?'
        cursor.execute(query, (username, password))
        result = cursor.fetchone()
        
        if result is not None:
            return jsonify(usuario=result)
        else:
            return jsonify('No se ha encontrado un usuario con esas credenciales'), 400
    except Exception as e:
        print(f'Error al buscar usuario: {e}')
        return jsonify({'mensaje': 'Error al buscar usuario'}), 500