# Sales Management App Backend

Python Flask backend for the Sales Management App with SQLite database.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize database:
```bash
python database.py
```

3. Run the server:
```bash
python app.py
```

Server runs on `http://localhost:5000`

## API Endpoints

- `GET /api/stock` - Get all stock items
- `POST /api/stock` - Add stock item
- `PUT /api/stock/<id>` - Update stock item
- `DELETE /api/stock/<id>` - Delete stock item
- `POST /api/sales` - Create sale
- `GET /api/sales/daily/<date>` - Get daily sales
- `POST /api/cashouts` - Add cash out
- `GET /api/cashouts/daily/<date>` - Get daily cash outs
- `GET /api/summary/daily/<date>` - Get daily summary
- `GET /api/summary/monthly/<year>/<month>` - Get monthly summary
- `GET /api/reminders` - Get reminders
- `POST /api/reminders` - Add reminder
- `GET /api/notes` - Get notes
- `POST /api/notes` - Add note
- `GET /api/targets` - Get business targets
- `POST /api/targets` - Add target

## Data Migration

To migrate existing localStorage data:
```bash
python sync.py
```