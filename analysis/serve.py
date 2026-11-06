"""Serve only generated review artifacts on loopback; never bind LAN interfaces."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket


class LocalServer(ThreadingHTTPServer):
    allow_reuse_address = False

    def server_bind(self):
        # Windows otherwise permits ambiguous simultaneous HTTP listeners.
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()

folder = Path(__file__).resolve().parent / 'local-publish'
if not (folder / 'index.html').exists():
    raise SystemExit('Run python publish.py first.')
server = LocalServer(('127.0.0.1', 18967), partial(SimpleHTTPRequestHandler, directory=str(folder)))
print('Local analysis: http://127.0.0.1:18967/', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
