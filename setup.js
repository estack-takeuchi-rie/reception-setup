const https = require('https');
const fs = require('fs');
const os = require('os');
const http = require('http');

const TOKEN = process.env.GT;
const DIR = os.homedir() + '/Desktop/reception';
const PORT = 8080;

try { fs.mkdirSync(DIR, { recursive: true }); } catch(e) {}

function download(file, outPath) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path: '/repos/estack-inc/entrance-reception/contents/' + file,
      headers: { 'Authorization': 'token ' + TOKEN, 'User-Agent': 'mino' }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          fs.writeFileSync(outPath, Buffer.from(json.content, 'base64'));
          console.log('✅ Downloaded:', file);
          resolve();
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

console.log('📥 Downloading files...');
Promise.all([
  download('index.html', DIR + '/index.html'),
  download('logo.png', DIR + '/logo.png')
]).then(() => {
  const server = http.createServer((req, res) => {
    const filePath = DIR + (req.url === '/' ? '/index.html' : req.url);
    const ext = filePath.split('.').pop();
    const types = { 'html': 'text/html; charset=utf-8', 'png': 'image/png', 'js': 'text/javascript', 'css': 'text/css' };
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      res.end(content);
    } catch(e) {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  // Find local IP
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let ip = '192.168.100.15';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) { ip = net.address; break; }
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 Server started!');
    console.log('📱 iPad URL: http://' + ip + ':' + PORT);
    console.log('');
    console.log('ターミナルを閉じないでください！');
  });
}).catch(e => console.error('Error:', e.message));
