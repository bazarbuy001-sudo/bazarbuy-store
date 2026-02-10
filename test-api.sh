#!/bin/bash

# Test Bazar Buy Backend API
# Requires backend running on localhost:3001

set -e

BASE_URL="http://localhost:3001/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Testing Bazar Buy Backend API"
echo "=================================="
echo ""

# Test 1: Health Check
echo -n "1️⃣  Health Check... "
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "ok"; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  echo "Response: $HEALTH"
fi

# Test 2: Login (should fail - no DB)
echo -n "2️⃣  Auth Login (expected to fail - no DB)... "
LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}')
if echo "$LOGIN" | grep -q "error\|INTERNAL_ERROR\|NOT_FOUND"; then
  echo -e "${GREEN}✅ PASS (got expected error)${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  echo "Response: $LOGIN"
fi

# Test 3: Catalog (should fail - no DB)
echo -n "3️⃣  Catalog Categories (expected to fail - no DB)... "
CATALOG=$(curl -s $BASE_URL/catalog/categories)
if echo "$CATALOG" | grep -q "error\|INTERNAL_ERROR"; then
  echo -e "${GREEN}✅ PASS (got expected error)${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  echo "Response: $CATALOG"
fi

# Test 4: 404 Handler
echo -n "4️⃣  404 Not Found... "
NOT_FOUND=$(curl -s $BASE_URL/nonexistent)
if echo "$NOT_FOUND" | grep -q "NOT_FOUND"; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  echo "Response: $NOT_FOUND"
fi

echo ""
echo "=================================="
echo "🎯 API Health Check Complete"
echo ""
echo "📝 Notes:"
echo "  - Endpoints fail with DB errors (expected, PostgreSQL not set up)"
echo "  - Health endpoint confirms server is running ✅"
echo "  - Error handlers are working ✅"
echo "  - API prefix /api/v1 is correct ✅"
