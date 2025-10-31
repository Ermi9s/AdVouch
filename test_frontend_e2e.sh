#!/bin/bash

# Frontend End-to-End Testing Script
# Tests all major frontend interactions and API integrations

set -e

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"

echo "=========================================="
echo "AdVouch Frontend E2E Testing"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
ERRORS_FOUND=()

# Function to test HTTP endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
        ((TESTS_FAILED++))
        ERRORS_FOUND+=("$name: Expected HTTP $expected_status, got $response")
        return 1
    fi
}

# Function to test API endpoint with JSON response
test_api_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Testing API: $name... "
    
    response=$(curl -s "$url")
    
    # Check if response is valid JSON
    if echo "$response" | python3 -m json.tool > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC} (Valid JSON)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Invalid JSON response)"
        ((TESTS_FAILED++))
        ERRORS_FOUND+=("$name: Invalid JSON response")
        echo "Response: $response"
        return 1
    fi
}

# Function to check for console errors in page
test_page_for_errors() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name for errors... "
    
    # Fetch the page and check for common error patterns
    response=$(curl -s "$url")
    
    if echo "$response" | grep -qi "error\|exception\|undefined is not"; then
        echo -e "${YELLOW}⚠ WARNING${NC} (Potential errors in page)"
        ERRORS_FOUND+=("$name: Potential errors detected in page content")
        return 1
    else
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    fi
}

echo "=========================================="
echo "1. Backend API Tests"
echo "=========================================="
echo ""

test_api_endpoint "Ads List" "$BACKEND_URL/api/v1/ads/"
test_api_endpoint "Business List" "$BACKEND_URL/api/v1/business/"
test_api_endpoint "Offers List" "$BACKEND_URL/api/v1/offer/"

echo ""
echo "=========================================="
echo "2. Frontend Page Load Tests"
echo "=========================================="
echo ""

test_endpoint "Homepage" "$FRONTEND_URL/"
test_endpoint "Ads Listing" "$FRONTEND_URL/ads"
test_endpoint "Business Listing" "$FRONTEND_URL/businesses"
test_endpoint "Login Page" "$FRONTEND_URL/login"
test_endpoint "Signup Page" "$FRONTEND_URL/signup"
test_endpoint "Auth Page" "$FRONTEND_URL/auth"

echo ""
echo "=========================================="
echo "3. Dynamic Routes Tests"
echo "=========================================="
echo ""

# Get first ad ID from API
FIRST_AD_ID=$(curl -s "$BACKEND_URL/api/v1/ads/" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else 1)")
test_endpoint "Ad Details Page" "$FRONTEND_URL/ads/$FIRST_AD_ID"

# Get first business ID from API
FIRST_BUSINESS_ID=$(curl -s "$BACKEND_URL/api/v1/business/" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else 1)")
test_endpoint "Business Details Page" "$FRONTEND_URL/businesses/$FIRST_BUSINESS_ID"

echo ""
echo "=========================================="
echo "4. Interaction Tracking Tests"
echo "=========================================="
echo ""

# Test interaction tracking endpoints
echo -n "Testing Click Tracking... "
click_response=$(curl -s -X POST "$BACKEND_URL/api/v1/track/click/" \
    -H "Content-Type: application/json" \
    -d "{\"ad_id\": $FIRST_AD_ID, \"referrer\": \"test\", \"user_agent\": \"test-agent\"}")

if echo "$click_response" | grep -q "success"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    ERRORS_FOUND+=("Click Tracking: Failed to track click")
fi

echo -n "Testing View Tracking... "
view_response=$(curl -s -X POST "$BACKEND_URL/api/v1/track/view/" \
    -H "Content-Type: application/json" \
    -d "{\"ad_id\": $FIRST_AD_ID}")

if echo "$view_response" | grep -q "success"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    ERRORS_FOUND+=("View Tracking: Failed to track view")
fi

echo -n "Testing Share Tracking... "
share_response=$(curl -s -X POST "$BACKEND_URL/api/v1/track/share/" \
    -H "Content-Type: application/json" \
    -d "{\"ad_id\": $FIRST_AD_ID}")

if echo "$share_response" | grep -q "success"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    ERRORS_FOUND+=("Share Tracking: Failed to track share")
fi

echo -n "Testing Search Tracking... "
search_response=$(curl -s -X POST "$BACKEND_URL/api/v1/track/search/" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"test search\", \"results_count\": 5}")

if echo "$search_response" | grep -q "success"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    ERRORS_FOUND+=("Search Tracking: Failed to track search")
fi

echo ""
echo "=========================================="
echo "5. Search Functionality Tests"
echo "=========================================="
echo ""

test_endpoint "Search with Query" "$FRONTEND_URL/ads?search=web"
test_endpoint "Business Search" "$FRONTEND_URL/businesses?search=tech"

echo ""
echo "=========================================="
echo "6. Export Feature Tests"
echo "=========================================="
echo ""

test_api_endpoint "Ad Embed Code" "$BACKEND_URL/api/v1/ads/$FIRST_AD_ID/embed-code/"
test_api_endpoint "Ad Export Data" "$BACKEND_URL/api/v1/ads/$FIRST_AD_ID/export/"

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ ${#ERRORS_FOUND[@]} -gt 0 ]; then
    echo -e "${RED}Errors Found:${NC}"
    for error in "${ERRORS_FOUND[@]}"; do
        echo -e "  ${RED}✗${NC} $error"
    done
    echo ""
fi

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}=========================================="
    echo "ALL TESTS PASSED! ✓"
    echo -e "==========================================${NC}"
    exit 0
else
    echo -e "${RED}=========================================="
    echo "SOME TESTS FAILED!"
    echo -e "==========================================${NC}"
    exit 1
fi

