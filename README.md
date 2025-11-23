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
Run the server with:
```bash
python -m uvicorn main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.
