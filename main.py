# from fastapi import FastAPI, Request, WebSocket
# from fastapi.templating import Jinja2Templates
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import HTMLResponse
# import asyncio
# import json
# from latency import measure_latency

# app = FastAPI()

# app.mount("/static", StaticFiles(directory="static"), name="static")

# templates = Jinja2Templates(directory="templates")

# TARGETS = [
#     {"name": "Google DNS", "host": "8.8.8.8"},
#     {"name": "Cloudflare DNS", "host": "1.1.1.1"},
#     {"name": "Localhost", "host": "127.0.0.1"}
# ]

# @app.get("/", response_class=HTMLResponse)
# async def read_root(request: Request):
#     return templates.TemplateResponse("index.html", {"request": request, "targets": TARGETS})

# @app.websocket("/ws/latency")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
    
#     connection_targets = list(TARGETS)
    
#     async def sender():
#         try:
#             while True:
#                 results = []
#                 for target in connection_targets:
#                     latency = await measure_latency(target["host"])
#                     results.append({
#                         "name": target["name"],
#                         "host": target["host"],
#                         "latency": latency
#                     })
#                 await websocket.send_text(json.dumps({"type": "update", "data": results}))
#                 await asyncio.sleep(1)
#         except Exception as e:
#             print(f"Sender error: {e}")

#     async def receiver():
#         try:
#             while True:
#                 data = await websocket.receive_text()
#                 message = json.loads(data)
#                 if message.get("type") == "add_target":
#                     host = message.get("host")
#                     if host and not any(t["host"] == host for t in connection_targets):
#                         connection_targets.append({
#                             "name": message.get("name", host),
#                             "host": host
#                         })
#         except Exception as e:
#             print(f"Receiver error: {e}")

#     sender_task = asyncio.create_task(sender())
#     receiver_task = asyncio.create_task(receiver())
    
#     done, pending = await asyncio.wait(
#         [sender_task, receiver_task],
#         return_when=asyncio.FIRST_COMPLETED,
#     )
    
#     for task in pending:
#         task.cancel()

# @app.get("/latency")
# async def check_latency(url: str):
#     host = url.replace("https://", "").replace("http://", "").split("/")[0]
#     latency = await measure_latency(host)
    
#     if latency is not None:
#         return {"latency": latency, "status": "success"}
#     else:
#         return {"latency": None, "status": "error"}
