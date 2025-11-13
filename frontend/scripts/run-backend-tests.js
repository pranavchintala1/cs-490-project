#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

console.log('\n🔧 Running Backend Tests...\n');

const backendDir = path.join(__dirname, '../../backend');
const venvDir = path.join(backendDir, '.venv');

// Determine the python executable path based on OS
let pythonPath;
let activateCmd;

if (os.platform() === 'win32') {
  pythonPath = path.join(venvDir, 'Scripts', 'python.exe');
  activateCmd = `${path.join(venvDir, 'Scripts', 'activate.bat')} && `;
} else {
  pythonPath = path.join(venvDir, 'bin', 'python');
  activateCmd = `source ${path.join(venvDir, 'bin', 'activate')} && `;
}

// Run pytest with the virtual environment activated
// Use full path to test file to avoid directory resolution issues
const testFile = path.join(backendDir, 'test_backend_comprehensive.py');
const cmd = `cd ${backendDir} && ${activateCmd}python -m pytest "${testFile}" -v`;

console.log('Running from:', backendDir);
console.log('');

const result = spawnSync('bash', ['-c', cmd], {
  stdio: 'inherit',
  shell: true,
});

// Show test summary
console.log('\n✅ Backend tests completed!\n');

// Exit with the same code as pytest (0 = all pass, 1 = failures/errors)
process.exit(result.status || 0);
