# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "websockets",
# ]
# ///
import asyncio
import websockets

async def main():
    try:
        async with websockets.connect("wss://telemetry.polkadot.io/submit"):
            print("WebSocket connected successfully.")
    except Exception as exc:
        print(f"WebSocket connection failed: {exc!r}")

asyncio.run(main())