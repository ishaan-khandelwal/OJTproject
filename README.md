# Network Latency Visualizer

This project is a real-time Network Latency Visualizer built with **FastAPI** (Backend) and **Chart.js** (Frontend).

## Features
- **Real-time Monitoring**: Measures latency to Google DNS (8.8.8.8), Cloudflare DNS (1.1.1.1), and Localhost.
- **Live Visualization**: Updates a line chart every second using WebSockets.
- **Status Dashboard**: Shows current latency values and status (Green/Red).

## Prerequisites
- Python 3.7+

## Installation
Dependencies are listed in `requirements.txt`.
```bash
pip install -r requirements.txt
```

## Running the App
1. Run the server in your terminal:
```bash
# Run the backend package directly
python -m uvicorn backend.main:app --reload
```

2. **Once the server is running**, open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

> **Note:** This link will **only** work if the server is running on your local machine. It will not work directly from GitHub.
