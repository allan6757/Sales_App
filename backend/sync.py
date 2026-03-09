import json
import sqlite3
from database import Database

class DataSync:
    def __init__(self):
        self.db = Database()
    
    def import_from_json(self, json_file):
        """Import data from JSON export (localStorage backup)"""
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Import stock items
        if 'stockItems' in data:
            for item in data['stockItems']:
                cursor.execute('''
                    INSERT OR REPLACE INTO stock_items 
                    (id, name, quantity, unit, price, low_stock_threshold, date_added)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (item['id'], item['name'], item['quantity'], item['unit'],
                      item['price'], item['lowStockThreshold'], item['dateAdded']))
        
        # Import sales
        if 'sales' in data:
            for sale in data['sales']:
                cursor.execute('''
                    INSERT OR REPLACE INTO sales (id, total, date, timestamp)
                    VALUES (?, ?, ?, ?)
                ''', (sale['id'], sale['total'], sale['date'], sale['timestamp']))
                
                for item in sale['items']:
                    cursor.execute('''
                        INSERT INTO sale_items 
                        (sale_id, item_id, item_name, quantity, price, total)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (sale['id'], item['itemId'], item['itemName'],
                          item['quantity'], item['price'], item['total']))
        
        # Import cash outs
        if 'cashOuts' in data:
            for cashout in data['cashOuts']:
                cursor.execute('''
                    INSERT OR REPLACE INTO cash_outs (id, amount, reason, date, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                ''', (cashout['id'], cashout['amount'], cashout['reason'],
                      cashout['date'], cashout['timestamp']))
        
        # Import daily summaries
        if 'dailySummaries' in data:
            for summary in data['dailySummaries']:
                cursor.execute('''
                    INSERT OR REPLACE INTO daily_summaries 
                    (date, total_sales, total_cash_out, net_amount, 
                     most_sold_item, total_transactions, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (summary['date'], summary['totalSales'], summary['totalCashOut'],
                      summary['netAmount'], summary['mostSoldItem'],
                      summary['totalTransactions'], summary['timestamp']))
        
        # Import reminders
        if 'reminders' in data:
            for reminder in data['reminders']:
                cursor.execute('''
                    INSERT OR REPLACE INTO reminders 
                    (id, title, description, date, time, completed, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (reminder['id'], reminder['title'], reminder.get('description', ''),
                      reminder['date'], reminder['time'], 
                      1 if reminder['completed'] else 0, reminder['createdAt']))
        
        # Import notes
        if 'notes' in data:
            for note in data['notes']:
                cursor.execute('''
                    INSERT OR REPLACE INTO notes 
                    (id, title, content, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                ''', (note['id'], note['title'], note.get('content', ''),
                      note['createdAt'], note['updatedAt']))
        
        # Import business targets
        if 'businessTargets' in data:
            for target in data['businessTargets']:
                cursor.execute('''
                    INSERT OR REPLACE INTO business_targets 
                    (id, title, description, target_value, current_value, 
                     type, deadline, achieved, achieved_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (target['id'], target['title'], target.get('description', ''),
                      target['targetValue'], target['currentValue'], target['type'],
                      target['deadline'], 1 if target['achieved'] else 0,
                      target.get('achievedAt'), target['createdAt']))
        
        conn.commit()
        conn.close()
        print("Data imported successfully!")
    
    def export_to_json(self, json_file):
        """Export database to JSON format"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        data = {}
        
        # Export stock items
        cursor.execute('SELECT * FROM stock_items')
        data['stockItems'] = [dict(zip([col[0] for col in cursor.description], row)) 
                              for row in cursor.fetchall()]
        
        # Export sales
        cursor.execute('SELECT * FROM sales')
        sales = []
        for row in cursor.fetchall():
            sale = dict(zip([col[0] for col in cursor.description], row))
            cursor.execute('SELECT * FROM sale_items WHERE sale_id=?', (sale['id'],))
            sale['items'] = [dict(zip([col[0] for col in cursor.description], r)) 
                           for r in cursor.fetchall()]
            sales.append(sale)
        data['sales'] = sales
        
        # Export cash outs
        cursor.execute('SELECT * FROM cash_outs')
        data['cashOuts'] = [dict(zip([col[0] for col in cursor.description], row)) 
                           for row in cursor.fetchall()]
        
        # Export daily summaries
        cursor.execute('SELECT * FROM daily_summaries')
        data['dailySummaries'] = [dict(zip([col[0] for col in cursor.description], row)) 
                                 for row in cursor.fetchall()]
        
        # Export reminders
        cursor.execute('SELECT * FROM reminders')
        data['reminders'] = [dict(zip([col[0] for col in cursor.description], row)) 
                            for row in cursor.fetchall()]
        
        # Export notes
        cursor.execute('SELECT * FROM notes')
        data['notes'] = [dict(zip([col[0] for col in cursor.description], row)) 
                        for row in cursor.fetchall()]
        
        # Export business targets
        cursor.execute('SELECT * FROM business_targets')
        data['businessTargets'] = [dict(zip([col[0] for col in cursor.description], row)) 
                                  for row in cursor.fetchall()]
        
        conn.close()
        
        with open(json_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Data exported to {json_file}")

if __name__ == '__main__':
    import sys
    sync = DataSync()
    
    if len(sys.argv) < 3:
        print("Usage:")
        print("  Import: python sync.py import data.json")
        print("  Export: python sync.py export data.json")
    else:
        action = sys.argv[1]
        filename = sys.argv[2]
        
        if action == 'import':
            sync.import_from_json(filename)
        elif action == 'export':
            sync.export_to_json(filename)
        else:
            print("Invalid action. Use 'import' or 'export'")
