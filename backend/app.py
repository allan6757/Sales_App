from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)
db = Database()

# Stock Management
@app.route('/api/stock', methods=['GET'])
def get_stock():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM stock_items')
    items = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/stock', methods=['POST'])
def add_stock():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO stock_items (id, name, quantity, unit, price, low_stock_threshold, date_added)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (data['id'], data['name'], data['quantity'], data['unit'], 
          data['price'], data['lowStockThreshold'], data['dateAdded']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/stock/<item_id>', methods=['PUT'])
def update_stock(item_id):
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE stock_items 
        SET name=?, quantity=?, unit=?, price=?, low_stock_threshold=?
        WHERE id=?
    ''', (data['name'], data['quantity'], data['unit'], 
          data['price'], data['lowStockThreshold'], item_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/stock/<item_id>', methods=['DELETE'])
def delete_stock(item_id):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM stock_items WHERE id=?', (item_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Sales
@app.route('/api/sales', methods=['GET'])
def get_sales():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM sales')
    sales = []
    for row in cursor.fetchall():
        sale = dict(zip([col[0] for col in cursor.description], row))
        cursor.execute('SELECT * FROM sale_items WHERE sale_id=?', (sale['id'],))
        sale['items'] = [dict(zip([col[0] for col in cursor.description], r)) for r in cursor.fetchall()]
        sales.append(sale)
    conn.close()
    return jsonify(sales)

@app.route('/api/sales', methods=['POST'])
def create_sale():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO sales (id, total, date, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (data['id'], data['total'], data['date'], data['timestamp']))
    
    for item in data['items']:
        cursor.execute('''
            INSERT INTO sale_items (sale_id, item_id, item_name, quantity, price, total)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data['id'], item['itemId'], item['itemName'], 
              item['quantity'], item['price'], item['total']))
        
        cursor.execute('UPDATE stock_items SET quantity = quantity - ? WHERE id = ?',
                      (item['quantity'], item['itemId']))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Cash Outs
@app.route('/api/cashouts', methods=['GET'])
def get_cashouts():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM cash_outs ORDER BY timestamp DESC')
    items = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/cashouts', methods=['POST'])
def add_cashout():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO cash_outs (id, amount, reason, date, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (data['id'], data['amount'], data['reason'], data['date'], data['timestamp']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/cashouts/<cashout_id>', methods=['DELETE'])
def delete_cashout(cashout_id):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM cash_outs WHERE id=?', (cashout_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Daily Summary
@app.route('/api/daily-summary', methods=['POST'])
def save_daily_summary():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO daily_summaries 
        (date, total_sales, total_cash_out, net_amount, most_sold_item, total_transactions, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (data['date'], data['totalSales'], data['totalCashOut'], 
          data['netAmount'], data['mostSoldItem'], data['totalTransactions'], data['timestamp']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/daily-summaries', methods=['GET'])
def get_daily_summaries():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM daily_summaries ORDER BY timestamp DESC')
    items = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(items)

# Reminders
@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM reminders ORDER BY date, time')
    items = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/reminders', methods=['POST'])
def add_reminder():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reminders (id, title, description, date, time, completed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (data['id'], data['title'], data.get('description', ''), 
          data['date'], data['time'], 0, data['createdAt']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/reminders/<reminder_id>', methods=['PUT'])
def update_reminder(reminder_id):
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE reminders SET completed=? WHERE id=?', 
                  (1 if data['completed'] else 0, reminder_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/reminders/<reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM reminders WHERE id=?', (reminder_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Notes
@app.route('/api/notes', methods=['GET'])
def get_notes():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM notes ORDER BY updated_at DESC')
    items = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/notes', methods=['POST'])
def add_note():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO notes (id, title, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (data['id'], data['title'], data.get('content', ''), 
          data['createdAt'], data['updatedAt']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE notes SET title=?, content=?, updated_at=? WHERE id=?
    ''', (data['title'], data.get('content', ''), data['updatedAt'], note_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM notes WHERE id=?', (note_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Business Targets
@app.route('/api/targets', methods=['GET'])
def get_targets():
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM business_targets ORDER BY deadline')
    items = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/targets', methods=['POST'])
def add_target():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO business_targets 
        (id, title, description, target_value, current_value, type, deadline, achieved, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (data['id'], data['title'], data.get('description', ''), 
          data['targetValue'], data.get('currentValue', 0), data['type'], 
          data['deadline'], 0, data['createdAt']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/targets/<target_id>', methods=['PUT'])
def update_target(target_id):
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE business_targets 
        SET current_value=?, achieved=?, achieved_at=?
        WHERE id=?
    ''', (data['currentValue'], 1 if data['achieved'] else 0, 
          data.get('achievedAt'), target_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/targets/<target_id>', methods=['DELETE'])
def delete_target(target_id):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM business_targets WHERE id=?', (target_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Settings
@app.route('/api/settings/<key>', methods=['GET'])
def get_setting(key):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT value FROM settings WHERE key=?', (key,))
    row = cursor.fetchone()
    conn.close()
    return jsonify({'value': row[0] if row else None})

@app.route('/api/settings', methods=['POST'])
def save_setting():
    data = request.json
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                  (data['key'], data['value']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
