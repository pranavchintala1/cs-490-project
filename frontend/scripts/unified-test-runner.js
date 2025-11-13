#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
};

const log = (color, text) => console.log(`${color}${text}${colors.reset}`);
const table = (data) => console.table(data);

let frontendResults = null;
let backendResults = null;

// Parse frontend test output
function runFrontendTests() {
  log(colors.cyan + colors.bright, '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(colors.cyan + colors.bright, '🧪 FRONTEND TESTS');
  log(colors.cyan + colors.bright, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result = spawnSync('npm', ['test', '--', '--watchAll=false', '--passWithNoTests'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    encoding: 'utf-8',
  });

  const output = result.stdout + result.stderr;
  
  // Parse results
  const suiteMatch = output.match(/Test Suites: (\d+) passed, (\d+) total/);
  const testMatch = output.match(/Tests:\s+(\d+) passed, (\d+) total/);
  const timeMatch = output.match(/Time:\s+([\d.]+\s+s)/);

  frontendResults = {
    passed: testMatch ? parseInt(testMatch[1]) : 0,
    total: testMatch ? parseInt(testMatch[2]) : 0,
    suitePassed: suiteMatch ? parseInt(suiteMatch[1]) : 0,
    suiteTotal: suiteMatch ? parseInt(suiteMatch[2]) : 0,
    time: timeMatch ? timeMatch[1] : 'N/A',
    exitCode: result.status,
  };

  // Print output
  console.log(output);

  return result.status;
}

// Parse backend test output
function runBackendTests() {
  log(colors.magenta + colors.bright, '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(colors.magenta + colors.bright, '🔧 BACKEND TESTS');
  log(colors.magenta + colors.bright, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const backendDir = path.join(__dirname, '../../backend');
  const venvDir = path.join(backendDir, '.venv');
  const isWindows = os.platform() === 'win32';
  const testFile = path.join(backendDir, 'test_backend_comprehensive.py');

  let result;

  if (isWindows) {
    // Windows batch file activation
    const activatePath = path.join(venvDir, 'Scripts', 'activate.bat');
    const cmd = `cd /d "${backendDir}" && "${activatePath}" && python -m pytest "${testFile}" -v --tb=short 2>&1`;
    result = spawnSync('cmd', ['/c', cmd], {
      stdio: 'pipe',
      encoding: 'utf-8',
      shell: true,
    });
  } else {
    // Unix/macOS bash activation
    const activatePath = path.join(venvDir, 'bin', 'activate');
    const cmd = `cd "${backendDir}" && source "${activatePath}" && python -m pytest "${testFile}" -v --tb=short 2>&1`;
    result = spawnSync('bash', ['-c', cmd], {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
  }

  const output = (result.stdout || '') + (result.stderr || '');

  // Parse results with null safety
  const passMatch = output ? output.match(/(\d+) passed/) : null;
  const failMatch = output ? output.match(/(\d+) failed/) : null;
  const timeMatch = output ? output.match(/in ([\d.]+)s/) : null;

  backendResults = {
    passed: passMatch ? parseInt(passMatch[1]) : 0,
    failed: failMatch ? parseInt(failMatch[1]) : 0,
    total: (passMatch ? parseInt(passMatch[1]) : 0) + (failMatch ? parseInt(failMatch[1]) : 0),
    time: timeMatch ? `${timeMatch[1]}s` : 'N/A',
    exitCode: result.status || 0,
  };

  // Print output
  if (output) {
    console.log(output);
  } else {
    log(colors.yellow, 'No test output received. Check if pytest is installed and venv is accessible.');
  }

  return result.status;
}

// Print unified summary
function printSummary() {
  log(colors.bright + colors.blue, '\n╔════════════════════════════════════════════════════════════════╗');
  log(colors.bright + colors.blue, '║            UNIFIED TEST RESULTS SUMMARY                         ║');
  log(colors.bright + colors.blue, '╚════════════════════════════════════════════════════════════════╝\n');

  // Frontend Summary Table
  log(colors.cyan + colors.bright, '📊 FRONTEND TEST SUITE');
  const frontendTable = {
    'Test Files': `${frontendResults.suitePassed}/${frontendResults.suiteTotal}`,
    'Total Tests': `${frontendResults.passed}/${frontendResults.total}`,
    'Execution Time': frontendResults.time,
    'Status': frontendResults.passed === frontendResults.total ? 
      `${colors.green}✅ ALL PASS${colors.reset}` : 
      `${colors.yellow}⚠️ ${frontendResults.total - frontendResults.passed} FAILED${colors.reset}`,
  };
  console.table(frontendTable);

  // Backend Summary Table
  log(colors.magenta + colors.bright, '🔧 BACKEND TEST SUITE');
  const backendTable = {
    'Total Tests': `${backendResults.passed}/${backendResults.total}`,
    'Passed': `${colors.green}${backendResults.passed}${colors.reset}`,
    'Failed': backendResults.failed > 0 ? 
      `${colors.yellow}${backendResults.failed}${colors.reset}` : 
      `${colors.green}0${colors.reset}`,
    'Execution Time': backendResults.time,
    'Status': backendResults.failed === 0 ? 
      `${colors.green}✅ ALL PASS${colors.reset}` : 
      `${colors.yellow}⚠️ ${backendResults.failed} FAILED${colors.reset}`,
  };
  console.table(backendTable);

  // Combined Statistics
  log(colors.bright + colors.green, '📈 COMBINED STATISTICS');
  const totalPassed = frontendResults.passed + backendResults.passed;
  const totalTests = frontendResults.total + backendResults.total;
  const totalFailed = (frontendResults.total - frontendResults.passed) + backendResults.failed;
  
  const combinedTable = {
    'Total Test Suites': `${frontendResults.suiteTotal} (frontend)`,
    'Total Tests': `${totalTests}`,
    'Tests Passed': `${colors.green}${totalPassed}${colors.reset} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`,
    'Tests Failed': totalFailed > 0 ? 
      `${colors.yellow}${totalFailed}${colors.reset} (${((totalFailed / totalTests) * 100).toFixed(1)}%)` : 
      `${colors.green}0${colors.reset} (0.0%)`,
    'Overall Status': totalFailed === 0 ? 
      `${colors.bright}${colors.green}✅ ALL TESTS PASSED${colors.reset}` : 
      `${colors.bright}${colors.yellow}⚠️ SOME TESTS FAILED${colors.reset}`,
  };
  console.table(combinedTable);

  // Breakdown by component
  log(colors.bright + colors.cyan, '🔍 BREAKDOWN');
  console.log(`
${colors.cyan}Frontend:${colors.reset}
  • ${colors.green}${frontendResults.passed}${colors.reset} tests passed
  • ${frontendResults.total - frontendResults.passed} tests failed
  • ${frontendResults.suiteTotal} test suites
  
${colors.magenta}Backend:${colors.reset}
  • ${colors.green}${backendResults.passed}${colors.reset} tests passed
  • ${colors.yellow}${backendResults.failed}${colors.reset} tests failed
  • ${backendResults.total} total tests
  
${colors.bright}${colors.blue}Combined:${colors.reset}
  • ${colors.green}${totalPassed}${colors.reset} tests passed
  • ${colors.yellow}${totalFailed}${colors.reset} tests failed
  • ${totalTests} total tests
  ${((totalPassed / totalTests) * 100).toFixed(1)}% pass rate
  `);

  // Exit code legend
  log(colors.dim, '═══════════════════════════════════════════════════════════════');
  console.log(`
${colors.green}✅ GREEN${colors.reset}   = Test passed
${colors.yellow}⚠️  YELLOW${colors.reset}  = Test failed or issue detected  
${colors.red}❌ RED${colors.reset}    = Critical error

${colors.dim}Legend:${colors.reset}
  • Pass Rate = (Tests Passed / Total Tests) × 100
  • All results are displayed above
  • Failed tests details shown in individual suite outputs
  `);

  log(colors.dim, '═══════════════════════════════════════════════════════════════\n');

  // Exit with appropriate code
  const exitCode = frontendResults.exitCode !== 0 || backendResults.exitCode !== 0 ? 1 : 0;
  process.exit(exitCode);
}

// Main execution
async function main() {
  log(colors.bright + colors.blue, '\n╔════════════════════════════════════════════════════════════════╗');
  log(colors.bright + colors.blue, '║          RUNNING UNIFIED TEST SUITE (Frontend + Backend)        ║');
  log(colors.bright + colors.blue, '╚════════════════════════════════════════════════════════════════╝');

  const frontendExit = runFrontendTests();
  const backendExit = runBackendTests();

  printSummary();
}

main();
