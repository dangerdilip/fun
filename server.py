#!/usr/bin/env python3
"""
Simple HTTP server with cache-control headers disabled,
so browsers always fetch fresh JS/asset files.
"""
import http.server
import socketserver

PORT = 8080

# Explicitly set MIME maps to fix potential Windows registry corruption mapping .js to text/plain
http.server.SimpleHTTPRequestHandler.extensions_map.update({
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
})

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress spam, only log errors
        if args[1] not in ('200', '304'):
            super().log_message(format, *args)

with socketserver.ThreadingTCPServer(('', PORT), NoCacheHandler) as httpd:
    print(f'FRACTURE dev server running at http://localhost:{PORT}')
    print('Cache-Control: no-store  (fresh JS every reload)')
    httpd.serve_forever()

