from flask import jsonify
import sqlite3

def login(dbUsers, username, password):
    connection = sqlite3.connect(dbUsers)
    cursor = connection.cursor()
    query = 'SELECT id, rol FROM user WHERE username = ? AND password = ?'
    cursor.execute(query, (username, password))
    result = cursor.fetchone()
    
    return result