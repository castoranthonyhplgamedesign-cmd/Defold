"""Serve generated game files on loopback with an exclusive Windows socket."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket
import json

ROOT=Path(__file__).resolve().parents[1]
class LocalServer(ThreadingHTTPServer):
    allow_reuse_address=False
    def server_bind(self):
        if hasattr(socket,'SO_EXCLUSIVEADDRUSE'):self.socket.setsockopt(socket.SOL_SOCKET,socket.SO_EXCLUSIVEADDRUSE,1)
        super().server_bind()
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,format,*args):pass
    def do_GET(self):
        if self.path.split('?',1)[0]in ['/','/index.html']:
            current=json.loads((ROOT/'local-publish/current.json').read_text())
            query='?'+self.path.split('?',1)[1]if '?'in self.path else ''
            self.send_response(302);self.send_header('Location','/'+current['revision']+'/'+query);self.end_headers();return
        super().do_GET()
server=LocalServer(('127.0.0.1',18982),partial(QuietHandler,directory=str(ROOT/'local-publish')))
print('CoinSort Defold: http://127.0.0.1:18982/',flush=True)
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
