# Network Latency Visualizer - Viva & Presentation Guide

## 1. Project Overview
**Title:** Network Latency Visualizer
**Goal:** To build a real-time web application that measures and visualizes the network latency (ping) to various websites.
**Problem Solved:** Helps users monitor their internet connection stability and speed to specific servers (like Google, Cloudflare, or their own servers) in real-time.

## 2. Technology Stack
*   **Backend:** Python with **FastAPI**.
    *   *Why?* It's modern, extremely fast (asynchronous), and easy to build APIs with.
*   **Frontend:** HTML, CSS, JavaScript with **Chart.js**.
    *   *Why?* Simple to deploy, Chart.js provides beautiful interactive graphs without complex frameworks like React.
*   **Networking:** `ping3` library.
    *   *Why?* Allows sending ICMP ping packets directly from Python code.
    what is ICMP?
    ICMP is a protocol used for communication between devices on a network. It is used to send error messages and to request information about the network.
    
        

## 3. System Architecture
1.  **User Action:** User enters a URL (e.g., `google.com`) and clicks "Start Test".
2.  **Frontend Request:** The browser sends an HTTP GET request to the backend:  
    `GET /latency?url=google.com`
3.  **Backend Processing:**
    *   FastAPI receives the request.
    *   It extracts the hostname (removes `https://`).
    *   It uses `ping3` to send a ping to that host.
    *   It waits for the response (latency in seconds).
4.  **Response:** Backend sends a JSON response back: `{"latency": 45.2, "status": "success"}`.
5.  **Visualization:** JavaScript receives the data and:
    *   Updates the Line Chart (Time vs Latency).
    *   Updates the Statistics (Min/Max/Avg).
    *   Adds a row to the History Table.

## 4. Key Code Explanation (For Viva)

### Backend (`main.py` & `latency.py`)
*   **`app = FastAPI()`**: Initializes the web server.
*   **`async def measure_latency(host)`**:
    *   This is an **asynchronous** function. It means it doesn't block the server while waiting for the ping reply.
    *   It uses `loop.run_in_executor` to run the blocking `ping` function in a separate thread so the server stays responsive.
*   **`@app.get("/latency")`**:
    *   This is the API Endpoint. It takes a `url` parameter, cleans it, measures latency, and returns the result.

### Frontend (`index.html`)
*   **`setInterval`**: This JavaScript function runs every X milliseconds (e.g., 1000ms = 1 second). It triggers the `fetch()` call to get new data repeatedly.
*   **`Chart.js`**: We use this library to render the graph. We push new data points to `chart.data.datasets` and call `chart.update()` to redraw it.

## 5. Potential Viva Questions & Answers

**Q1: What is Latency?**
**A:** Latency is the time it takes for a data packet to travel from your computer to a server and back. It is usually measured in milliseconds (ms). Lower is better.

**Q2: Why did you use FastAPI instead of Flask or Django?**
**A:** FastAPI is built on `asyncio`, making it much faster for handling multiple concurrent requests (like real-time monitoring) compared to Flask. It also provides automatic data validation.

**Q3: How does the Ping work?**
**A:** It uses the **ICMP** (Internet Control Message Protocol). It sends an "Echo Request" packet to the target, and the target sends back an "Echo Reply". We measure the time difference.

**Q4: What happens if the internet goes down?**
**A:** The ping function will return `None` or timeout. Our code handles this by returning a `status: "error"` and the frontend displays it as a "Timeout" or red status.

**Q5: Is this Real-Time?**
**A:** It is "near real-time". We poll the server every few seconds. For true real-time streaming, we could use WebSockets (which we implemented in an earlier version!), but HTTP polling is simpler and sufficient for this interval.

## 6. Presentation Tips
1.  **Start with a Demo:** Open the app, click "Google", and let the chart draw. Visuals impress!
2.  **Show the Stats:** Point out how the "Average Latency" updates dynamically.
3.  **Mention Extensibility:** Say "In the future, I can add a database to save history permanently or add email alerts for high latency."
