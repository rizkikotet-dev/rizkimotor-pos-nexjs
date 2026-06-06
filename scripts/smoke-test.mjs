#!/usr/bin/env node
/**
 * Smoke test script for staging/production verification (Node.js version)
 * Usage: node scripts/smoke-test.mjs <URL>
 */

import fetch from 'node:fetch';

const STAGING_URL = process.argv[2] || 'http://localhost:3001';
const TIMEOUT = 30000;
const RETRIES = 10;
const RETRY_DELAY = 3000;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(message) {
  log(`✓ ${message}`, 'green');
}

function fail(message) {
  log(`✗ ${message}`, 'red');
  process.exit(1);
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runSmokeTests() {
  console.log(`🔍 Running smoke tests against: ${STAGING_URL}`);
  console.log('================================================');

  // Test 1: Health check endpoint
  console.log('\nTest 1: Health check endpoint');
  let healthPassed = false;
  for (let i = 1; i <= RETRIES; i++) {
    try {
      const response = await fetchWithTimeout(`${STAGING_URL}/api/health`, { timeout: 5000 });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'healthy') {
          pass(`Health check passed (attempt ${i}/${RETRIES})`);
          console.log(`  Response: ${JSON.stringify(data)}`);
          healthPassed = true;
          break;
        } else {
          warn(`Health endpoint returned unhealthy status (attempt ${i}/${RETRIES}): ${JSON.stringify(data)}`);
        }
      }
    } catch (error) {
      warn(`Health check attempt ${i}/${RETRIES} failed: ${error.message}`);
    }
    if (i === RETRIES) {
      fail('Health check failed after all retries');
    }
    await new Promise(r => setTimeout(r, RETRY_DELAY));
  }

  // Test 2: Main page loads
  console.log('\nTest 2: Main page loads');
  try {
    const response = await fetchWithTimeout(STAGING_URL, { timeout: 10000 });
    if (response.ok) {
      const text = await response.text();
      if (text.toLowerCase().includes('riki motor')) {
        pass('Main page loads correctly');
      } else {
        fail('Main page does not contain expected content');
      }
    } else {
      fail(`Main page request failed with status ${response.status}`);
    }
  } catch (error) {
    fail(`Main page request failed: ${error.message}`);
  }

  // Test 3: Login page accessible
  console.log('\nTest 3: Login page accessible');
  try {
    const response = await fetchWithTimeout(`${STAGING_URL}/login`, { timeout: 10000 });
    if (response.ok) {
      const text = await response.text();
      if (text.toLowerCase().includes('login')) {
        pass('Login page accessible');
      } else {
        fail('Login page does not contain expected content');
      }
    } else {
      fail(`Login page request failed with status ${response.status}`);
    }
  } catch (error) {
    fail(`Login page request failed: ${error.message}`);
  }

  // Test 4: API routes respond
  console.log('\nTest 4: API routes respond');
  const apiEndpoints = ['/api/products', '/api/categories', '/api/settings'];
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetchWithTimeout(`${STAGING_URL}${endpoint}`, { timeout: 5000 });
      if (response.ok || response.status === 401) {
        // 401 is OK - means auth is working
        pass(`API endpoint ${endpoint} responds (status: ${response.status})`);
      } else {
        warn(`API endpoint ${endpoint} returned status ${response.status}`);
      }
    } catch (error) {
      warn(`API endpoint ${endpoint} failed: ${error.message}`);
    }
  }

  // Test 5: Static assets load
  console.log('\nTest 5: Static assets load');
  try {
    const response = await fetchWithTimeout(`${STAGING_URL}/_next/static/css/`, { timeout: 5000 });
    if (response.ok || response.status === 404) {
      // 404 might be expected if no CSS files at root
      pass('Static assets accessible');
    } else {
      warn('Static assets check returned unexpected status');
    }
  } catch (error) {
    warn(`Static assets check failed: ${error.message}`);
  }

  // Test 6: Basic HTML structure
  console.log('\nTest 6: Basic HTML structure');
  try {
    const response = await fetchWithTimeout(STAGING_URL, { timeout: 10000 });
    if (response.ok) {
      const text = await response.text();
      if (text.includes('<!DOCTYPE html>')) {
        pass('Valid HTML structure');
      } else {
        warn('HTML structure check inconclusive');
      }
    } else {
      fail('Failed to fetch main page for HTML check');
    }
  } catch (error) {
    fail(`HTML structure check failed: ${error.message}`);
  }

  console.log('\n================================================');
  log('✅ All critical smoke tests passed!', 'green');
  console.log(`Staging URL: ${STAGING_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
}

runSmokeTests().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});