#!/usr/bin/env node
/**
 * NutriCook API Proxy
 *
 * Simple Node.js proxy to protect Claude API key
 * Frontend sends request to /api/recipes, proxy adds API key and forwards to Anthropic
 *
 * Usage: node api-proxy.js
 * Set CLAUDE_API_KEY environment variable before running
 */

const http = require('http');
const https = require('https');
const url = require('url');

const API_KEY = process.env.CLAUDE_API_KEY || 'sk-';
const PORT = 3500;
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

if (!API_KEY || API_KEY === 'sk-') {
  console.error('ERROR: CLAUDE_API_KEY environment variable not set');
  console.error('Usage: CLAUDE_API_KEY=sk-... node api-proxy.js');
  process.exit(1);
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

  // Only allow POST to /api/recipes
  if (req.method !== 'POST' || req.url !== '/api/recipes') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
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

      // Build Claude API request
      const claudePayload = JSON.stringify({
        model: payload.model || 'claude-opus-4-1',
        max_tokens: payload.max_tokens || 1024,
        messages: payload.messages || [],
      });

      // Make request to Claude API
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(claudePayload),
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
      };

      const claudeReq = https.request(options, (claudeRes) => {
        let responseBody = '';

        claudeRes.on('data', chunk => {
          responseBody += chunk;
        });

        claudeRes.on('end', () => {
          res.writeHead(claudeRes.statusCode);
          res.end(responseBody);
        });
      });

      claudeReq.on('error', err => {
        console.error('Claude API error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Claude API error', details: err.message }));
      });

      claudeReq.write(claudePayload);
      claudeReq.end();
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
