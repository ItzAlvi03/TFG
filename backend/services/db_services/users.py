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

#   SUMMARY: Method to create new users if the user doesn't exists in users.db
#   RETURN: successfull or None
#   VALUES: dbUsers(BD PATH), username(user's name), password(user's password), rol(user's rol)
def create_account(dbUsers, username, password, rol):
    # If exists return None
    if user_exists(dbUsers, username):
        return None
    else:
        # If user doesn't exists create it
        connection = sqlite3.connect(dbUsers)
        cursor = connection.cursor()
        query = 'INSERT INTO user (username,password,rol) VALUES(?,?,?)'
        cursor.execute(query, (username, password, rol))
        connection.commit()
        return cursor.lastrowid

# Check if exists any user with a specific username    
def user_exists(dbUsers, username):
    try:
        connection = sqlite3.connect(dbUsers)
        cursor = connection.cursor()
        query = 'SELECT COUNT(*) FROM user WHERE username = ?'
        cursor.execute(query, (username,))
        return cursor.fetchone()[0] > 0
    except sqlite3.Error:
        return True