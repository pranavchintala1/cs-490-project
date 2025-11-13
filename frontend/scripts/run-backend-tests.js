#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

console.log('\n🔧 Running Backend Tests...\n');

const backendDir = path.join(__dirname, '../../backend');
const venvDir = path.join(backendDir, '.venv');
const isWindows = os.platform() === 'win32';
const testFile = path.join(backendDir, 'test_backend_comprehensive.py');

let result;

if (isWindows) {
  // Windows batch file activation
  const activatePath = path.join(venvDir, 'Scripts', 'activate.bat');
  const cmd = `cd /d "${backendDir}" && "${activatePath}" && python -m pytest "${testFile}" -v`;
  console.log('Running from:', backendDir);
  console.log('Platform: Windows\n');
  result = spawnSync('cmd', ['/c', cmd], {
    stdio: 'inherit',
    shell: true,
  });
} else {
  // Unix/macOS bash activation
  const activatePath = path.join(venvDir, 'bin', 'activate');
  const cmd = `cd "${backendDir}" && source "${activatePath}" && python -m pytest "${testFile}" -v`;
  console.log('Running from:', backendDir);
  console.log('Platform:', os.platform() === 'darwin' ? 'macOS' : 'Linux\n');
  result = spawnSync('bash', ['-c', cmd], {
    stdio: 'inherit',
    shell: true,
  });
}

// Show test summary
console.log('\n✅ Backend tests completed!\n');

// Exit with the same code as pytest (0 = all pass, 1 = failures/errors)
process.exit(result.status || 0);
