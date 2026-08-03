import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAppiumTests } from './appium-runner.js';
import { ExcelReporter } from './excel-reporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check if server is reachable
function checkServer(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 302);
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Helper to wait for the Vite dev server to boot
async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const isUp = await checkServer(url);
    if (isUp) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log('=====================================================');
  console.log('       GramVoice Appium Screens Testing Suite        ');
  console.log('=====================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const baseUrl = 'http://localhost:5173';
  let devServerProcess = null;

  try {
    const alreadyRunning = await checkServer(baseUrl);
    
    if (alreadyRunning) {
      console.log(`Vite server already detected running at ${baseUrl}. Re-using session.`);
    } else {
      console.log('Starting local Vite development server...');
      
      devServerProcess = spawn('npx', ['vite'], {
        cwd: rootDir,
        shell: true,
        stdio: 'pipe'
      });

      console.log('Waiting for Vite server port to become active...');
      const serverStarted = await waitForServer(baseUrl, 15000);
      if (!serverStarted) {
        throw new Error('Vite dev server failed to start or respond within 15 seconds.');
      }
      console.log(`Vite server is running and ready at ${baseUrl}.\n`);
    }

    // Execute Mobile (Appium) test suite
    const results = await runAppiumTests(baseUrl);

    // Generate double-tabbed Excel report
    console.log(`Consolidating ${results.length} mobile screen test results...`);
    const reporter = new ExcelReporter(path.join(__dirname, 'reports'));
    const reportPath = await reporter.generateReport(results);

    console.log('\n=====================================================');
    console.log('               Execution Summary                      ');
    console.log('=====================================================');
    console.log(`Total Mobile Cases Run: ${results.length}`);
    console.log(`Passed:                ${results.filter(r => r.status === 'PASS').length}`);
    console.log(`Failed:                ${results.filter(r => r.status === 'FAIL').length}`);
    console.log(`Skipped:               ${results.filter(r => r.status === 'SKIPPED').length}`);
    console.log(`Excel Report:          ${reportPath}`);
    console.log('=====================================================\n');

  } catch (error) {
    console.error('CRITICAL ERROR in orchestrator run:', error);
  } finally {
    if (devServerProcess) {
      console.log('Stopping local Vite server process...');
      devServerProcess.kill();
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', devServerProcess.pid, '/f', '/t'], { shell: true });
        }
      } catch (e) {}
      console.log('Vite server process terminated.');
    }
    
    process.exit(0);
  }
}

main();
