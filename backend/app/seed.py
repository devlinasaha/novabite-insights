import pandas as pd
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
DB_PATH = os.path.join(BASE_DIR, "novabite.db")
CSV_PATH = os.path.join(BASE_DIR, "..", "data", "novabite_sales_data.csv")


def seed():
    df = pd.read_csv(CSV_PATH)
    conn = sqlite3.connect(DB_PATH)
    df.to_sql("sales", conn, if_exists="replace", index=False)
    conn.close()
    print(f"Seeded {len(df)} rows into {DB_PATH}")


if __name__ == "__main__":
    seed()