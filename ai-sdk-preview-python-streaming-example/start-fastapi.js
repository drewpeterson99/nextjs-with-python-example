const { spawn } = require('child_process');
const path = require('path');

const pythonPath = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
const args = ['-m', 'uvicorn', 'api.index:app', '--reload', '--host', '127.0.0.1', '--port', '8000'];

const child = spawn(pythonPath, args, {
  stdio: 'inherit',
  shell: false,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('Error starting FastAPI server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

