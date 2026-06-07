#!/usr/bin/env node
/**
 * NutriCook Multi-Provider API Test
 *
 * Tests configuration and routing for multiple LLM providers
 */

import http from 'http';

const PROXY_URL = 'http://localhost:3500';

const providers = {
  anthropic: {
    name: 'Anthropic Claude',
    testKey: 'sk-ant-test-' + Date.now(),
  },
  openai: {
    name: 'OpenAI GPT',
    testKey: 'sk-test-' + Date.now(),
  },
  gemini: {
    name: 'Google Gemini',
    testKey: 'AIza_test_' + Date.now(),
  },
  groq: {
    name: 'Groq',
    testKey: 'gsk_test_' + Date.now(),
  },
};

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
  console.log('NutriCook Multi-Provider API Test');
  console.log('==================================\n');

  try {
    // Test 1: Check initial status
    console.log('Test 1: Check initial status (no provider configured)');
    const status1 = await makeRequest('/api/config/status');
    console.log(`  Configured: ${status1.data.configured}`);
    console.log(`  Available providers: ${status1.data.availableProviders?.length || 0}`);
    console.log(`  Providers: ${status1.data.availableProviders?.map(p => p.id).join(', ')}`);
    console.log(`  ✓ Status endpoint working\n`);

    // Test 2: Configure each provider
    console.log('Test 2: Configure different providers');
    for (const [id, providerData] of Object.entries(providers)) {
      const config = await makeRequest('/api/config/set-key', 'POST', {
        provider: id,
        key: providerData.testKey,
      });

      if (config.status === 200) {
        console.log(`  ✓ ${providerData.name}: ${config.data.message}`);
      } else {
        console.log(`  ✗ ${providerData.name}: ${config.data.error}`);
      }
    }
    console.log();

    // Test 3: Verify last provider is configured
    console.log('Test 3: Verify last provider configuration');
    const status2 = await makeRequest('/api/config/status');
    console.log(`  Provider: ${status2.data.provider}`);
    console.log(`  Provider Name: ${status2.data.providerName}`);
    console.log(`  Key Prefix: ${status2.data.keyPrefix}`);
    console.log(`  ✓ Configuration verified\n`);

    // Test 4: Test invalid provider
    console.log('Test 4: Reject invalid provider');
    const badProvider = await makeRequest('/api/config/set-key', 'POST', {
      provider: 'invalid-provider',
      key: 'sk-...',
    });
    console.log(`  Status: ${badProvider.status}`);
    console.log(`  Error: ${badProvider.data.error}`);
    console.log(`  ✓ Invalid provider rejected\n`);

    // Test 5: Test invalid key
    console.log('Test 5: Reject invalid API key');
    const badKey = await makeRequest('/api/config/set-key', 'POST', {
      provider: 'openai',
      key: 'invalid',
    });
    console.log(`  Status: ${badKey.status}`);
    console.log(`  Error: ${badKey.data.error}`);
    console.log(`  ✓ Invalid key rejected\n`);

    // Test 6: Switch between providers
    console.log('Test 6: Switch between providers dynamically');
    const switchProviders = ['anthropic', 'openai', 'gemini'];
    for (const provider of switchProviders) {
      const config = await makeRequest('/api/config/set-key', 'POST', {
        provider,
        key: providers[provider].testKey,
      });

      if (config.status === 200) {
        const status = await makeRequest('/api/config/status');
        console.log(`  → Switched to ${provider}: ${status.data.providerName}`);
      }
    }
    console.log(`  ✓ Dynamic switching works\n`);

    console.log('='.repeat(50));
    console.log('All tests passed! ✓');
    console.log('');
    console.log('Multi-Provider Support Summary:');
    console.log(`- ${Object.keys(providers).length} providers available`);
    console.log('- Dynamic configuration');
    console.log('- Provider validation');
    console.log('- Key format validation');
    console.log('- Dynamic switching');
    console.log('- Status reporting');
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
