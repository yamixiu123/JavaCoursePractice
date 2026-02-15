const { spawn, spawnSync } = require('child_process');

const children = [];
let shuttingDown = false;

function start(name, npmScript) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run ${npmScript}`]
    : ['run', npmScript];

  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[dev:all] ${name} exited (${reason}), stopping all processes...`);
    shutdown(code ?? 1);
  });

  child.on('error', (err) => {
    if (shuttingDown) return;
    console.error(`[dev:all] failed to start ${name}:`, err.message);
    shutdown(1);
  });

  children.push(child);
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    killProcessTree(child.pid);
  }

  setTimeout(() => {
    for (const child of children) {
      killProcessTree(child.pid, true);
    }
    process.exit(exitCode);
  }, 1200);
}

function killProcessTree(pid, force = false) {
  if (!pid) return;
  if (process.platform === 'win32') {
    const args = ['/PID', String(pid), '/T'];
    if (force) args.push('/F');
    spawnSync('taskkill', args, { stdio: 'ignore' });
    return;
  }
  try {
    process.kill(pid, force ? 'SIGKILL' : 'SIGTERM');
  } catch {
    // Ignore already-exited processes.
  }
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start('server', 'dev:server');
start('frontend', 'dev');
