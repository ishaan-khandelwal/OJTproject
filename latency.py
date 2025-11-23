import asyncio
from ping3 import ping

async def measure_latency(host: str) -> float:
    """
    Measures latency to a host using ICMP ping.
    Returns latency in milliseconds or None if unreachable.
    """
    try:
        # ping3.ping returns seconds, convert to ms
        # timeout is in seconds
        loop = asyncio.get_running_loop()
        # Run synchronous ping in a separate thread to avoid blocking the event loop
        latency_sec = await loop.run_in_executor(None, ping, host, 1)
        
        if latency_sec is None:
            return None
        
        return round(latency_sec * 1000, 2)
    except Exception as e:
        print(f"Error pinging {host}: {e}")
        return None
