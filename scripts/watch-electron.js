const { spawn, execSync } = require('child_process');
const http = require('http');

const viteUrl = 'http://localhost:5173';

function checkViteReady() {
  return new Promise((resolve) => {
    const check = () => {
      http.get(viteUrl, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 250);
        }
      }).on('error', () => {
        setTimeout(check, 250);
      });
    };
    check();
  });
}

async function start() {
  console.log('Waiting for Vite dev server...');
  await checkViteReady();
  console.log('Vite is ready. Compiling main process TypeScript...');
  
  try {
    execSync('npx tsc -p tsconfig.main.json', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to compile main process:', err);
  }

  console.log('Starting Electron...');
  const electronProcess = spawn('npx', ['electron', '.'], {
    shell: true,
    stdio: 'inherit'
  });

  electronProcess.on('close', (code) => {
    process.exit(code || 0);
  });
}

start();
