import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "novabite.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def query_all(sql, params=()):
    conn = get_connection()
    try:
        cursor = conn.execute(sql, params)
        rows = [dict(row) for row in cursor.fetchall()]
        return rows
    finally:
        conn.close()


def query_one(sql, params=()):
    rows = query_all(sql, params)
    return rows[0] if rows else None