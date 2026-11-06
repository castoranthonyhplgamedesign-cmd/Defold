from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import mimetypes
root=Path(__file__).resolve().parent.parent
mimetypes.add_type('application/wasm','.wasm')
class Handler(SimpleHTTPRequestHandler):
 protocol_version='HTTP/1.1'
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  super().end_headers()
class Server(ThreadingHTTPServer):
 request_queue_size=128
 daemon_threads=True
server=Server(('127.0.0.1',8171),partial(Handler,directory=str(root/'local-publish')))
print('Serving only http://127.0.0.1:8171',flush=True)
server.serve_forever()
