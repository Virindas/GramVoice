import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ExcelLoadReporter } from './excel-load-reporter.js';

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
  console.log('       GramVoice Baseline Concurrency Load Tester     ');
  console.log('=====================================================\n');

  const rootDir = path.resolve(__dirname, '../..');
  const targetUrl = 'http://localhost:5173';
  const concurrency = 300;
  const durationSeconds = 60;
  let devServerProcess = null;

  try {
    // 1. Check if server is already running, if not start it
    const alreadyRunning = await checkServer(targetUrl);
    
    if (alreadyRunning) {
      console.log(`Vite server already detected running at ${targetUrl}. Re-using session.`);
    } else {
      console.log('Starting local Vite development server...');
      devServerProcess = spawn('npx', ['vite'], {
        cwd: rootDir,
        shell: true,
        stdio: 'pipe'
      });

      console.log('Waiting for Vite server port to become active...');
      const serverStarted = await waitForServer(targetUrl, 15000);
      if (!serverStarted) {
        throw new Error('Vite dev server failed to start or respond within 15 seconds.');
      }
      console.log(`Vite server is running and ready at ${targetUrl}.\n`);
    }

    // KeepAlive agent for high concurrency connection pool reuse
    const agent = new http.Agent({
      keepAlive: true,
      maxSockets: concurrency,
      maxFreeSockets: concurrency,
      timeout: 3000
    });

    const startTime = Date.now();
    const testEndTime = startTime + (durationSeconds * 1000);
    
    const requestLogs = [];
    let activeUsersCount = 0;
    let keepRunning = true;

    // Second-by-second timeline statistics compiler
    const secondStats = [];
    for (let i = 1; i <= durationSeconds; i++) {
      secondStats.push({
        second: i,
        users: 0,
        requests: 0,
        success: 0,
        fail: 0,
        latencies: []
      });
    }

    console.log(`Spawning ${concurrency} virtual users concurrent connection loops...`);
    console.log(`Load test will run for ${durationSeconds} seconds.\n`);

    // Define simulated client request loop
    async function simulateUserLoop(userId) {
      activeUsersCount++;
      
      while (keepRunning && Date.now() < testEndTime) {
        const reqStartHr = process.hrtime();
        const secondIndex = Math.min(
          Math.floor((Date.now() - startTime) / 1000) + 1,
          durationSeconds
        );

        if (secondIndex <= 0) {
          await new Promise(r => setTimeout(r, 50));
          continue;
        }

        const bucket = secondStats[secondIndex - 1];
        if (bucket) {
          bucket.requests++;
          bucket.users = activeUsersCount;
        }

        try {
          await new Promise((resolve, reject) => {
            const req = http.get(targetUrl, { agent }, (res) => {
              // Consume response data to free socket back to pool
              res.on('data', () => {});
              res.on('end', () => {
                const diff = process.hrtime(reqStartHr);
                const latencyMs = (diff[0] * 1000) + (diff[1] / 1000000);
                
                const success = res.statusCode === 200 || res.statusCode === 302;
                if (bucket) {
                  if (success) {
                    bucket.success++;
                  } else {
                    bucket.fail++;
                  }
                  bucket.latencies.push(latencyMs);
                }
                
                requestLogs.push({ success, latencyMs });
                resolve();
              });
            });

            req.on('error', (err) => {
              reject(err);
            });

            req.setTimeout(2500, () => {
              req.destroy();
              reject(new Error('Timeout'));
            });
          });
        } catch (err) {
          const diff = process.hrtime(reqStartHr);
          const latencyMs = (diff[0] * 1000) + (diff[1] / 1000000);
          
          if (bucket) {
            bucket.fail++;
            bucket.latencies.push(latencyMs);
          }
          requestLogs.push({ success: false, latencyMs });
        }

        // Pacing delay to prevent local port exhaustion and simulate user reading pacing
        await new Promise(r => setTimeout(r, 60));
      }
      
      activeUsersCount--;
    }

    // Launch all loops in parallel
    const userLoops = [];
    for (let i = 0; i < concurrency; i++) {
      userLoops.push(simulateUserLoop(i));
    }

    // Live display compiler interface log ticks every 1 second
    const liveInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      if (elapsedSec > 0 && elapsedSec <= durationSeconds) {
        const bucket = secondStats[elapsedSec - 1];
        if (bucket && bucket.requests > 0) {
          const avg = bucket.latencies.length > 0 
            ? bucket.latencies.reduce((s, l) => s + l, 0) / bucket.latencies.length 
            : 0;
          console.log(`[Second ${elapsedSec.toString().padStart(2, '0')}/${durationSeconds}]: ` +
            `Active Users: ${bucket.users} | ` +
            `RPS: ${bucket.requests} | ` +
            `Success: ${bucket.success} | ` +
            `Failures: ${bucket.fail} | ` +
            `Avg Latency: ${Math.round(avg)}ms`
          );
        }
      }
    }, 1000);

    // Wait until test timer expires
    await new Promise(resolve => setTimeout(resolve, durationSeconds * 1000));
    keepRunning = false;
    clearInterval(liveInterval);

    // Await all client loops termination
    await Promise.all(userLoops);
    console.log('\nAll virtual user sessions finished.');

    // 3. Compile Consolidated Metrics
    const totalReqs = requestLogs.length;
    const successReqs = requestLogs.filter(l => l.success).length;
    const failReqs = totalReqs - successReqs;
    const successRate = totalReqs > 0 ? (successReqs / totalReqs) * 100 : 0;
    
    const allLatencies = requestLogs.map(l => l.latencyMs);
    const avgLatency = allLatencies.length > 0 
      ? allLatencies.reduce((s, l) => s + l, 0) / allLatencies.length 
      : 0;
    const minLatency = allLatencies.length > 0 ? Math.min(...allLatencies) : 0;
    const maxLatency = allLatencies.length > 0 ? Math.max(...allLatencies) : 0;
    const avgRps = totalReqs / durationSeconds;

    const summaryReport = {
      targetUrl,
      concurrency,
      duration: durationSeconds,
      totalRequests: totalReqs,
      avgRps,
      successRequests: successReqs,
      failRequests: failReqs,
      successRate,
      avgLatency,
      minLatency: Math.round(minLatency),
      maxLatency: Math.round(maxLatency)
    };

    // Populate timeline and ensure each second offset maps correctly
    const timelineReport = secondStats.map(bucket => {
      const avg = bucket.latencies.length > 0 
        ? bucket.latencies.reduce((s, l) => s + l, 0) / bucket.latencies.length 
        : 0;
      const min = bucket.latencies.length > 0 ? Math.min(...bucket.latencies) : 0;
      const max = bucket.latencies.length > 0 ? Math.max(...bucket.latencies) : 0;
      const rate = bucket.requests > 0 ? (bucket.success / bucket.requests) * 100 : 0;

      return {
        second: bucket.second,
        users: bucket.users,
        requests: bucket.requests,
        success: bucket.success,
        fail: bucket.fail,
        avgLatency: avg,
        minLatency: Math.round(min),
        maxLatency: Math.round(max),
        successRate: rate
      };
    });

    // 4. Generate Excel Report
    const reporter = new ExcelLoadReporter(path.join(__dirname, '../reports'));
    const excelPath = await reporter.generateReport(summaryReport, timelineReport);

    console.log('\n=====================================================');
    console.log('           LOAD TEST RESULTS SUMMARY                  ');
    console.log('=====================================================');
    console.log(`Target URL:      ${targetUrl}`);
    console.log(`Concurrency:     ${concurrency} Virtual Users`);
    console.log(`Duration:        ${durationSeconds} seconds`);
    console.log(`Total Requests:  ${totalReqs}`);
    console.log(`Avg Throughput:  ${avgRps.toFixed(1)} req/sec`);
    console.log(`Success Rate:    ${successRate.toFixed(2)}%`);
    console.log(`Avg Latency:     ${Math.round(avgLatency)}ms`);
    console.log(`Min Latency:     ${Math.round(minLatency)}ms`);
    console.log(`Max Latency:     ${Math.round(maxLatency)}ms`);
    console.log(`Excel Report:    ${excelPath}`);
    console.log('=====================================================\n');

  } catch (error) {
    console.error('CRITICAL ERROR running load test:', error);
  } finally {
    // 5. Clean up Vite server if we started it
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
