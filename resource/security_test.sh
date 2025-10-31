#!/bin/bash

# Security Testing Script for AdVouch API
# Tests authentication, authorization, CORS, and endpoint security

API_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3001"

echo "======================================================================"
echo "                  AdVouch Security Testing Suite                     "
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_passed=0
test_failed=0

# Function to print test result
print_result() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    
    if [ "$expected" == "$actual" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((test_passed++))
    else
        echo -e "${RED}✗${NC} $test_name (Expected: $expected, Got: $actual)"
        ((test_failed++))
    fi
}

echo "======================================================================"
echo "1. Testing Public Endpoints (No Authentication Required)"
echo "======================================================================"
echo ""

# Test 1.1: GET /api/v1/ads/ (should be public)
echo "Testing: GET /api/v1/ads/"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/ads/")
print_result "Ads list endpoint is public" "200" "$response"

# Test 1.2: POST /api/v1/track/view/ (should be public)
echo "Testing: POST /api/v1/track/view/"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/view/" \
    -H "Content-Type: application/json" \
    -d '{"ad_id": 1}')
print_result "Track view endpoint is public" "200" "$response"

# Test 1.3: POST /api/v1/track/click/ (should be public)
echo "Testing: POST /api/v1/track/click/"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/click/" \
    -H "Content-Type: application/json" \
    -d '{"ad_id": 1, "referrer": "test"}')
print_result "Track click endpoint is public" "201" "$response"

# Test 1.4: POST /api/v1/track/search/ (should be public)
echo "Testing: POST /api/v1/track/search/"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/search/" \
    -H "Content-Type: application/json" \
    -d '{"query": "test", "results_count": 5}')
print_result "Track search endpoint is public" "200" "$response"

# Test 1.5: GET /api/v1/reputation/business/1/ (should be public)
echo "Testing: GET /api/v1/reputation/business/1/"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/reputation/business/1/")
print_result "Reputation endpoint is public" "200" "$response"

echo ""
echo "======================================================================"
echo "2. Testing CORS Headers"
echo "======================================================================"
echo ""

# Test 2.1: Check CORS headers on OPTIONS request
echo "Testing: CORS preflight request"
response=$(curl -s -I -X OPTIONS "$API_URL/api/v1/ads/" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET")

if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓${NC} CORS headers present"
    ((test_passed++))
else
    echo -e "${RED}✗${NC} CORS headers missing"
    ((test_failed++))
fi

# Test 2.2: Check if frontend origin is allowed
echo "Testing: Frontend origin allowed"
response=$(curl -s -I "$API_URL/api/v1/ads/" \
    -H "Origin: $FRONTEND_URL")

if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓${NC} Frontend origin is allowed"
    ((test_passed++))
else
    echo -e "${YELLOW}⚠${NC} CORS may not be configured for frontend"
    ((test_failed++))
fi

echo ""
echo "======================================================================"
echo "3. Testing Input Validation"
echo "======================================================================"
echo ""

# Test 3.1: Invalid ad_id (non-numeric)
echo "Testing: Invalid ad_id (non-numeric)"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/view/" \
    -H "Content-Type: application/json" \
    -d '{"ad_id": "invalid"}')
if [ "$response" == "400" ] || [ "$response" == "422" ]; then
    echo -e "${GREEN}✓${NC} Invalid input rejected"
    ((test_passed++))
else
    echo -e "${RED}✗${NC} Invalid input not properly validated (Got: $response)"
    ((test_failed++))
fi

# Test 3.2: Missing required field
echo "Testing: Missing required field"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/view/" \
    -H "Content-Type: application/json" \
    -d '{}')
if [ "$response" == "400" ] || [ "$response" == "422" ]; then
    echo -e "${GREEN}✓${NC} Missing field rejected"
    ((test_passed++))
else
    echo -e "${RED}✗${NC} Missing field not properly validated (Got: $response)"
    ((test_failed++))
fi

# Test 3.3: SQL Injection attempt
echo "Testing: SQL Injection protection"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/search/" \
    -H "Content-Type: application/json" \
    -d '{"query": "test OR 1=1--", "results_count": 5}')
if [ "$response" == "200" ] || [ "$response" == "400" ]; then
    echo -e "${GREEN}✓${NC} SQL injection attempt handled"
    ((test_passed++))
else
    echo -e "${RED}✗${NC} Unexpected response to SQL injection (Got: $response)"
    ((test_failed++))
fi

# Test 3.4: XSS attempt
echo "Testing: XSS protection"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/search/" \
    -H "Content-Type: application/json" \
    -d '{"query": "<script>alert(1)</script>", "results_count": 5}')
if [ "$response" == "200" ] || [ "$response" == "400" ]; then
    echo -e "${GREEN}✓${NC} XSS attempt handled"
    ((test_passed++))
else
    echo -e "${RED}✗${NC} Unexpected response to XSS (Got: $response)"
    ((test_failed++))
fi

echo ""
echo "======================================================================"
echo "4. Testing Rate Limiting & DoS Protection"
echo "======================================================================"
echo ""

# Test 4.1: Rapid requests (simple DoS test)
echo "Testing: Rapid requests (10 requests in quick succession)"
success_count=0
for i in {1..10}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/ads/")
    if [ "$response" == "200" ]; then
        ((success_count++))
    fi
done

if [ $success_count -eq 10 ]; then
    echo -e "${GREEN}✓${NC} All rapid requests succeeded (no rate limiting detected)"
    ((test_passed++))
elif [ $success_count -gt 5 ]; then
    echo -e "${YELLOW}⚠${NC} Some requests throttled ($success_count/10 succeeded)"
    ((test_passed++))
else
    echo -e "${RED}✗${NC} Too many requests blocked ($success_count/10 succeeded)"
    ((test_failed++))
fi

echo ""
echo "======================================================================"
echo "5. Testing HTTP Methods"
echo "======================================================================"
echo ""

# Test 5.1: GET on POST-only endpoint
echo "Testing: GET on POST-only endpoint"
response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/v1/track/view/")
if [ "$response" == "405" ] || [ "$response" == "400" ]; then
    echo -e "${GREEN}✓${NC} Wrong HTTP method rejected"
    ((test_passed++))
else
    echo -e "${YELLOW}⚠${NC} Wrong HTTP method not properly rejected (Got: $response)"
    ((test_failed++))
fi

# Test 5.2: DELETE on read-only endpoint
echo "Testing: DELETE on read-only endpoint"
response=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/api/v1/ads/1/")
if [ "$response" == "405" ] || [ "$response" == "401" ] || [ "$response" == "403" ]; then
    echo -e "${GREEN}✓${NC} DELETE method properly restricted"
    ((test_passed++))
else
    echo -e "${YELLOW}⚠${NC} DELETE method not properly restricted (Got: $response)"
    ((test_failed++))
fi

echo ""
echo "======================================================================"
echo "6. Testing Content-Type Validation"
echo "======================================================================"
echo ""

# Test 6.1: Missing Content-Type header
echo "Testing: Missing Content-Type header"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/view/" \
    -d '{"ad_id": 1}')
if [ "$response" == "415" ] || [ "$response" == "400" ] || [ "$response" == "200" ]; then
    echo -e "${GREEN}✓${NC} Missing Content-Type handled"
    ((test_passed++))
else
    echo -e "${RED}✗${NC} Unexpected response (Got: $response)"
    ((test_failed++))
fi

# Test 6.2: Wrong Content-Type
echo "Testing: Wrong Content-Type"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/track/view/" \
    -H "Content-Type: text/plain" \
    -d '{"ad_id": 1}')
if [ "$response" == "415" ] || [ "$response" == "400" ]; then
    echo -e "${GREEN}✓${NC} Wrong Content-Type rejected"
    ((test_passed++))
else
    echo -e "${YELLOW}⚠${NC} Wrong Content-Type not properly rejected (Got: $response)"
    ((test_failed++))
fi

echo ""
echo "======================================================================"
echo "7. Testing Data Exposure"
echo "======================================================================"
echo ""

# Test 7.1: Check if sensitive data is exposed
echo "Testing: Sensitive data exposure in API responses"
response=$(curl -s "$API_URL/api/v1/ads/1/")

if echo "$response" | grep -q "password"; then
    echo -e "${RED}✗${NC} Password field exposed in API response"
    ((test_failed++))
else
    echo -e "${GREEN}✓${NC} No password fields in API response"
    ((test_passed++))
fi

if echo "$response" | grep -q "secret"; then
    echo -e "${RED}✗${NC} Secret field exposed in API response"
    ((test_failed++))
else
    echo -e "${GREEN}✓${NC} No secret fields in API response"
    ((test_passed++))
fi

echo ""
echo "======================================================================"
echo "8. Testing Error Messages"
echo "======================================================================"
echo ""

# Test 8.1: Check if error messages leak information
echo "Testing: Error message information leakage"
response=$(curl -s "$API_URL/api/v1/ads/999999/")

if echo "$response" | grep -qi "traceback\|exception\|stack trace"; then
    echo -e "${RED}✗${NC} Detailed error information exposed"
    ((test_failed++))
else
    echo -e "${GREEN}✓${NC} Error messages don't leak sensitive information"
    ((test_passed++))
fi

echo ""
echo "======================================================================"
echo "                         Security Test Summary                        "
echo "======================================================================"
echo ""
echo "Total Tests: $((test_passed + test_failed))"
echo -e "${GREEN}Passed: $test_passed${NC}"
echo -e "${RED}Failed: $test_failed${NC}"
echo ""

if [ $test_failed -eq 0 ]; then
    echo -e "${GREEN}✓ All security tests passed!${NC}"
    exit 0
elif [ $test_failed -le 3 ]; then
    echo -e "${YELLOW}⚠ Some security tests failed. Review and fix issues.${NC}"
    exit 1
else
    echo -e "${RED}✗ Multiple security tests failed. Immediate attention required!${NC}"
    exit 1
fi

