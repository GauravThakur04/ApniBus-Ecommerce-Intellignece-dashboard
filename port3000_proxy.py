import http.server
import urllib.request
import sys

TARGET = "http://127.0.0.1:8000"

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self._proxy()

    def do_POST(self):
        self._proxy()

    def do_HEAD(self):
        self._proxy()

    def do_OPTIONS(self):
        self._proxy()

    def _proxy(self):
        url = f"{TARGET}{self.path}"
        headers = {k: v for k, v in self.headers.items() if k.lower() != 'host'}
        body = None
        if 'content-length' in self.headers:
            length = int(self.headers['content-length'])
            body = self.rfile.read(length)

        req = urllib.request.Request(url, data=body, headers=headers, method=self.command)
        try:
            with urllib.request.urlopen(req) as resp:
                self.send_response(resp.status)
                for k, v in resp.getheaders():
                    if k.lower() not in ('transfer-encoding', 'content-encoding'):
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(resp.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for k, v in e.headers.items():
                if k.lower() not in ('transfer-encoding', 'content-encoding'):
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(e.read())
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:
            try:
                self.send_response(502)
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
            except:
                pass

    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    server = http.server.ThreadingHTTPServer(('0.0.0.0', 3000), ProxyHandler)
    server.serve_forever()
