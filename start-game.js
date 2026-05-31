const { spawn } = require('child_process');
const path = require('path');

console.log('正在启动化学元素合成挑战游戏...\n');

const frontend = spawn('node', ['-e', `
const http = require('http');
const fs = require('fs');
const path = require('path');
process.chdir('${path.join(__dirname, 'frontend').replace(/\\/g, '\\\\')}');

const PORT = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('前端服务器运行中: http://localhost:' + PORT);
});
`]);

frontend.stdout.on('data', (data) => {
  console.log('[前端] ' + data.toString().trim());
});

frontend.stderr.on('data', (data) => {
  console.error('[前端错误] ' + data.toString().trim());
});

const backend = spawn('node', [path.join(__dirname, 'backend', 'standalone-server.js')]);

backend.stdout.on('data', (data) => {
  console.log('[后端] ' + data.toString().trim());
});

backend.stderr.on('data', (data) => {
  console.error('[后端错误] ' + data.toString().trim());
});

console.log('\n游戏正在启动，请稍候...');
console.log('访问地址: http://localhost:8080\n');
console.log('按 Ctrl+C 可以停止游戏\n');

process.on('SIGINT', () => {
  console.log('\n正在关闭游戏...');
  frontend.kill();
  backend.kill();
  process.exit(0);
});
