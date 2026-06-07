#!/usr/bin/env node
/**
 * NutriCook API Proxy — Multi-Provider
 *
 * Proxy to protect API keys and support multiple LLM providers
 * Frontend sends request to /api/recipes, proxy routes to selected provider
 *
 * Supported Providers:
 * - Anthropic Claude (sk-ant-*)
 * - OpenAI GPT (sk-*)
 * - Google Gemini (AIza*)
 * - Groq (gsk_*)
 *
 * Usage:
 *   NUTRICOOK_PROVIDER=anthropic NUTRICOOK_API_KEY=sk-... node api-proxy.js
 *   Or configure via app: http://localhost:3456 → Settings
 */

import http from 'http';
import https from 'https';

// Config from environment variables
let CONFIG = {
  provider: process.env.NUTRICOOK_PROVIDER || null,
  apiKey: process.env.NUTRICOOK_API_KEY || null,
};

const PORT = 3500;

// Provider configurations
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    headers: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    }),
    buildPayload: (messages, model, maxTokens) => ({
      model: model || 'claude-opus-4-1',
      max_tokens: maxTokens || 1024,
      messages,
    }),
    parseResponse: (data) => data.content[0].text,
  },
  openai: {
    name: 'OpenAI GPT',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
    }),
    buildPayload: (messages, model, maxTokens) => ({
      model: model || 'gpt-4-turbo',
      max_tokens: maxTokens || 1024,
      messages,
    }),
    parseResponse: (data) => data.choices[0].message.content,
  },
  gemini: {
    name: 'Google Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
    headers: (key) => ({}),
    buildPayload: (messages, model, maxTokens) => ({
      contents: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: { maxOutputTokens: maxTokens || 1024 },
    }),
    parseResponse: (data) => data.candidates[0].content.parts[0].text,
    queryParam: (key) => `?key=${key}`,
  },
  groq: {
    name: 'Groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
    }),
    buildPayload: (messages, model, maxTokens) => ({
      model: model || 'mixtral-8x7b-32768',
      max_tokens: maxTokens || 1024,
      messages,
    }),
    parseResponse: (data) => data.choices[0].message.content,
  },
};

if (CONFIG.provider && CONFIG.apiKey) {
  console.log(`✓ Using ${PROVIDERS[CONFIG.provider]?.name || CONFIG.provider}`);
  console.log(`✓ API key loaded from environment`);
} else {
  console.log('⚠ API provider not configured. You can:');
  console.log('  1. Set environment: NUTRICOOK_PROVIDER=anthropic NUTRICOOK_API_KEY=sk-...');
  console.log('  2. Configure via app: http://localhost:3456 → Settings');
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3456');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle config endpoints
  if (req.url === '/api/config/set-key' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { provider, key } = payload;

        if (!provider || !Object.keys(PROVIDERS).includes(provider)) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid provider. Use: anthropic, openai, gemini, groq' }));
          return;
        }

        if (!key || key.length < 5) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid API key' }));
          return;
        }

        CONFIG.provider = provider;
        CONFIG.apiKey = key;
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: `Configured ${PROVIDERS[provider].name}`,
        }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  if (req.url === '/api/config/status' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      configured: !!CONFIG.apiKey && !!CONFIG.provider,
      provider: CONFIG.provider || null,
      providerName: CONFIG.provider ? PROVIDERS[CONFIG.provider].name : null,
      keyPrefix: CONFIG.apiKey ? CONFIG.apiKey.substring(0, 15) + '...' : 'not set',
      availableProviders: Object.entries(PROVIDERS).map(([key, val]) => ({
        id: key,
        name: val.name,
      })),
    }));
    return;
  }

  // Only allow POST to /api/recipes
  if (req.method !== 'POST' || req.url !== '/api/recipes') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Check if API key is configured
  if (!CONFIG.apiKey || !CONFIG.provider) {
    res.writeHead(503);
    res.end(JSON.stringify({ error: 'API not configured. Go to Settings to configure.' }));
    return;
  }

  // Read request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const providerConfig = PROVIDERS[CONFIG.provider];

      if (!providerConfig) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Unknown provider' }));
        return;
      }

      // Build request for the selected provider
      const providerPayload = providerConfig.buildPayload(
        payload.messages || [],
        payload.model,
        payload.max_tokens,
      );

      const payloadStr = JSON.stringify(providerPayload);
      let apiUrl = providerConfig.apiUrl;

      // Handle Gemini's query parameter format
      if (CONFIG.provider === 'gemini') {
        apiUrl += providerConfig.queryParam(CONFIG.apiKey);
      }

      const urlObj = new URL(apiUrl);
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadStr),
        ...providerConfig.headers(CONFIG.apiKey),
      };

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers,
      };

      const providerReq = https.request(options, (providerRes) => {
        let responseBody = '';

        providerRes.on('data', chunk => {
          responseBody += chunk;
        });

        providerRes.on('end', () => {
          if (providerRes.statusCode !== 200) {
            res.writeHead(providerRes.statusCode);
            res.end(responseBody);
            return;
          }

          try {
            const providerResponse = JSON.parse(responseBody);
            const textContent = providerConfig.parseResponse(providerResponse);

            // Normalize response format for frontend
            const normalizedResponse = {
              content: [{ text: textContent }],
            };

            res.writeHead(200);
            res.end(JSON.stringify(normalizedResponse));
          } catch (err) {
            console.error('Response parsing error:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to parse provider response' }));
          }
        });
      });

      providerReq.on('error', err => {
        console.error(`${CONFIG.provider} API error:`, err);
        res.writeHead(500);
        res.end(JSON.stringify({
          error: `${PROVIDERS[CONFIG.provider].name} API error`,
          details: err.message,
        }));
      });

      providerReq.write(payloadStr);
      providerReq.end();
    } catch (err) {
      console.error('Request parsing error:', err);
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request', details: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`NutriCook API Proxy running on http://localhost:${PORT}`);
  console.log('Protecting Claude API key');
  console.log('Frontend should send requests to http://localhost:3500/api/recipes');
});
