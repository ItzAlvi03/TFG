from flask import jsonify
import sqlite3

#   SUMMARY: Method to see if exists users in users.db
#   RETURN: user data or None
#   VALUES: dbUsers(BD PATH), username(user's name), password(user's password)
def login(dbUsers, username, password):
    connection = sqlite3.connect(dbUsers)
    cursor = connection.cursor()
    query = 'SELECT id, rol FROM user WHERE username = ? AND password = ?'
    cursor.execute(query, (username, password))
    result = cursor.fetchone()
    
    return result