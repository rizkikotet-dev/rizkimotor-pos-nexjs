#!/usr/bin/env bash
# Smoke test script for staging/production verification
# Usage: ./scripts/smoke-test.sh <URL>

set -euo pipefail

STAGING_URL="${1:-http://localhost:3001}"
TIMEOUT=30
RETRIES=10

echo "🔍 Running smoke tests against: $STAGING_URL"
echo "================================================"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✓${NC} $1"
}

fail() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Health check endpoint
echo ""
echo "Test 1: Health check endpoint"
for i in $(seq 1 $RETRIES); do
  if response=$(curl -sf --max-time 5 "$STAGING_URL/api/health" 2>/dev/null); then
    if echo "$response" | grep -q '"status":"healthy"'; then
      pass "Health check passed (attempt $i/$RETRIES)"
      echo "  Response: $response"
      break
    else
      warn "Health endpoint returned unhealthy status (attempt $i/$RETRIES): $response"
    fi
  fi
  if [ $i -eq $RETRIES ]; then
    fail "Health check failed after $RETRIES attempts"
  fi
  sleep 3
done

# Test 2: Main page loads
echo ""
echo "Test 2: Main page loads"
if response=$(curl -sf --max-time 10 "$STAGING_URL" 2>/dev/null); then
  if echo "$response" | grep -qi "RIZKI MOTOR"; then
    pass "Main page loads correctly"
  else
    fail "Main page does not contain expected content"
  fi
else
  fail "Main page request failed"
fi

# Test 3: Login page accessible
echo ""
echo "Test 3: Login page accessible"
if response=$(curl -sf --max-time 10 "$STAGING_URL/login" 2>/dev/null); then
  if echo "$response" | grep -qi "login"; then
    pass "Login page accessible"
  else
    fail "Login page does not contain expected content"
  fi
else
  fail "Login page request failed"
fi

# Test 4: API routes respond
echo ""
echo "Test 4: API routes respond"
for endpoint in "/api/products" "/api/categories" "/api/settings"; do
  if curl -sf --max-time 5 "$STAGING_URL$endpoint" > /dev/null 2>&1; then
    pass "API endpoint $endpoint responds"
  else
    warn "API endpoint $endpoint failed (may require auth)"
  fi
done

# Test 5: Static assets load
echo ""
echo "Test 5: Static assets load"
if response=$(curl -sf --max-time 5 "$STAGING_URL/_next/static/css/" 2>/dev/null); then
  pass "Static assets accessible"
else
  warn "Static assets check failed (may be expected in some configs)"
fi

# Test 6: No console errors in main page (basic check)
echo ""
echo "Test 6: Basic HTML structure"
if response=$(curl -sf --max-time 10 "$STAGING_URL" 2>/dev/null); then
  if echo "$response" | grep -q "<!DOCTYPE html>"; then
    pass "Valid HTML structure"
  else
    warn "HTML structure check inconclusive"
  fi
else
  fail "Failed to fetch main page for HTML check"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ All critical smoke tests passed!${NC}"
echo "Staging URL: $STAGING_URL"
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"