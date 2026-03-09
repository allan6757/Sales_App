import sqlite3
from datetime import datetime
from typing import Optional

class Database:
    def __init__(self, db_path='sales_management.db'):
        self.db_path = db_path
        self.init_db()
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Stock Items
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stock_items (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT NOT NULL,
                price REAL NOT NULL,
                low_stock_threshold REAL NOT NULL,
                date_added TEXT NOT NULL
            )
        ''')
        
        # Sales
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sales (
                id TEXT PRIMARY KEY,
                total REAL NOT NULL,
                date TEXT NOT NULL,
                timestamp INTEGER NOT NULL
            )
        ''')
        
        # Sale Items
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sale_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sale_id TEXT NOT NULL,
                item_id TEXT NOT NULL,
                item_name TEXT NOT NULL,
                quantity REAL NOT NULL,
                price REAL NOT NULL,
                total REAL NOT NULL,
                FOREIGN KEY (sale_id) REFERENCES sales(id)
            )
        ''')
        
        # Cash Outs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cash_outs (
                id TEXT PRIMARY KEY,
                amount REAL NOT NULL,
                reason TEXT NOT NULL,
                date TEXT NOT NULL,
                timestamp INTEGER NOT NULL
            )
        ''')
        
        # Daily Summaries
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                total_sales REAL NOT NULL,
                total_cash_out REAL NOT NULL,
                net_amount REAL NOT NULL,
                most_sold_item TEXT,
                total_transactions INTEGER NOT NULL,
                timestamp INTEGER NOT NULL
            )
        ''')
        
        # Reminders
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reminders (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Notes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        
        # Business Targets
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS business_targets (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                target_value REAL NOT NULL,
                current_value REAL DEFAULT 0,
                type TEXT NOT NULL,
                deadline TEXT NOT NULL,
                achieved INTEGER DEFAULT 0,
                achieved_at TEXT,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Settings
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
