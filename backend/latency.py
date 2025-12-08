import asyncio
import time
import requests

async def measure_latency(url: str) -> float:
    if not url.startswith("http"):
        url = f"http://{url}"

    def _request():
        start = time.time()
        requests.get(url, timeout=5)
        end = time.time()
        return (end - start) * 1000

    try:
        loop = asyncio.get_running_loop()
        latency = await loop.run_in_executor(None, _request)
        return round(latency, 2)
    except Exception as e:
        print(f"Error: {e}")
        return None


