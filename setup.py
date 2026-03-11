#!/usr/bin/env python3
import os, json, base64, http.server, socket
from urllib.request import Request, urlopen
from pathlib import Path

TOKEN = os.environ.get('GT', '')
DIR = Path.home() / 'Desktop' / 'reception'
PORT = 8080

DIR.mkdir(parents=True, exist_ok=True)

def download(file):
    url = f'https://api.github.com/repos/estack-inc/entrance-reception/contents/{file}'
    req = Request(url, headers={'Authorization': f'token {TOKEN}', 'User-Agent': 'mino'})
    res = json.loads(urlopen(req).read())
    data = base64.b64decode(res['content'])
    out = DIR / file
    out.write_bytes(data)
    print(f'✅ Downloaded: {file}')

print('📥 Downloading files...')
download('index.html')
download('logo.png')

# Get local IP
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(('8.8.8.8', 80))
ip = s.getsockname()[0]
s.close()

print(f'\n🚀 Server started!')
print(f'📱 iPadで開くURL: http://{ip}:{PORT}')
print(f'\nターミナルを閉じないでください！\n')

os.chdir(DIR)
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=PORT, bind='0.0.0.0')
