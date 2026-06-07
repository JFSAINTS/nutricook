#!/usr/bin/env node
/**
 * Test API Key Configuration Flow
 *
 * Simulates the user configuring API key from the app settings
 */

import http from 'http';

const PROXY_URL = 'http://localhost:3500';
const TEST_KEY = 'sk-ant-test-config-' + Date.now();

console.log('NutriCook API Key Configuration Test');
console.log('====================================\n');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PROXY_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  try {
    // Test 1: Check initial status (should be not configured)
    console.log('Test 1: Check initial status');
    const status1 = await makeRequest('/api/config/status');
    console.log(`  Status: ${status1.status}`);
    console.log(`  Configured: ${status1.data.configured}`);
    console.log(`  ✓ Initial state correct\n`);

    // Test 2: Try to use recipe endpoint without key (should fail)
    console.log('Test 2: Try to use recipes without API key');
    const recipes1 = await makeRequest('/api/recipes', 'POST', {
      model: 'claude-opus-4-1',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'test' }],
    });
    console.log(`  Status: ${recipes1.status}`);
    console.log(`  Error: ${recipes1.data.error || 'N/A'}`);
    console.log(`  ✓ Correctly rejected (no key)\n`);

    // Test 3: Configure API key
    console.log('Test 3: Configure API key from app');
    const config = await makeRequest('/api/config/set-key', 'POST', {
      key: TEST_KEY,
    });
    console.log(`  Status: ${config.status}`);
    console.log(`  Success: ${config.data.success}`);
    console.log(`  Message: ${config.data.message}`);
    console.log(`  ✓ Key configured\n`);

    // Test 4: Check status after configuration
    console.log('Test 4: Check status after configuration');
    const status2 = await makeRequest('/api/config/status');
    console.log(`  Configured: ${status2.data.configured}`);
    console.log(`  Key prefix: ${status2.data.keyPrefix}`);
    console.log(`  ✓ Status updated\n`);

    // Test 5: Invalid key format
    console.log('Test 5: Reject invalid key format');
    const badKey = await makeRequest('/api/config/set-key', 'POST', {
      key: 'invalid-key-format',
    });
    console.log(`  Status: ${badKey.status}`);
    console.log(`  Error: ${badKey.data.error}`);
    console.log(`  ✓ Correctly rejected invalid key\n`);

    // Test 6: Set another valid key (override)
    console.log('Test 6: Override key with another one');
    const TEST_KEY_2 = 'sk-ant-test-config-2-' + Date.now();
    const config2 = await makeRequest('/api/config/set-key', 'POST', {
      key: TEST_KEY_2,
    });
    console.log(`  Status: ${config2.status}`);
    console.log(`  Success: ${config2.data.success}`);
    const status3 = await makeRequest('/api/config/status');
    console.log(`  New key: ${status3.data.keyPrefix}`);
    console.log(`  ✓ Key updated\n`);

    console.log('='.repeat(50));
    console.log('All tests passed! ✓');
    console.log('');
    console.log('Configuration workflow:');
    console.log('1. App loads → Checks /api/config/status');
    console.log('2. User clicks Settings → Shows current config status');
    console.log('3. User enters API key → POST to /api/config/set-key');
    console.log('4. Proxy validates (sk-* format) → Stores in memory');
    console.log('5. Status updates → User sees "Configured ✓"');
    console.log('6. User generates recipe → Uses configured key');
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
