#!/bin/bash

# Integration Test Script for Restaurant Booking System
# This script tests all API endpoints and user flows

API_URL="http://localhost:5001/api"
ADMIN_TOKEN=""
CUSTOMER_TOKEN=""
BOOKING_ID=""
TABLE_ID=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "=========================================="
echo "Restaurant Booking System - Integration Tests"
echo "=========================================="
echo ""

# Wait for API to be ready
echo "Waiting for API to be ready..."
sleep 3

# Test 1: Health Check - Get all tables (public endpoint)
echo -e "\n${YELLOW}[TEST 1] Health Check - Get Tables${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/tables")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    print_test 0 "API is accessible and returns tables"
else
    print_test 1 "API health check failed (HTTP $HTTP_CODE)"
fi

# Test 2: Login with admin credentials
echo -e "\n${YELLOW}[TEST 2] Admin Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@restaurant.com","password":"admin123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    ADMIN_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    print_test 0 "Admin login successful"
else
    print_test 1 "Admin login failed (HTTP $HTTP_CODE)"
fi

# Test 3: Register new customer
echo -e "\n${YELLOW}[TEST 3] Customer Registration${NC}"
RANDOM_EMAIL="testuser$(date +%s)@test.com"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"testuser$(date +%s)\",\"email\":\"$RANDOM_EMAIL\",\"password\":\"test123\",\"fullName\":\"Test User\",\"phoneNumber\":\"0812345678\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    print_test 0 "Customer registration successful"
else
    print_test 1 "Customer registration failed (HTTP $HTTP_CODE)"
fi

# Test 4: Login with new customer
echo -e "\n${YELLOW}[TEST 4] Customer Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"test123\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    CUSTOMER_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    print_test 0 "Customer login successful"
else
    print_test 1 "Customer login failed (HTTP $HTTP_CODE)"
fi

# Test 5: Get available tables
echo -e "\n${YELLOW}[TEST 5] Get Available Tables${NC}"
TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d)
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/tables/available?date=$TOMORROW&timeSlot=19:00-21:00")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    # Find a table with capacity >= 4 for our test booking
    TABLE_ID=$(echo "$BODY" | grep -o '"id":[0-9]*,"tableNumber":"[^"]*","capacity":[0-9]*' | grep -o '"capacity":[4-9]' | head -1 | grep -o '[0-9]*$')
    if [ -z "$TABLE_ID" ]; then
        # Fallback: get any table with capacity 4+
        TABLE_ID=$(echo "$BODY" | python3 -c "import sys, json; tables = json.load(sys.stdin); print(next((t['id'] for t in tables if t['capacity'] >= 4), ''))" 2>/dev/null || echo "3")
    fi
    print_test 0 "Get available tables successful (Found table ID: $TABLE_ID)"
else
    print_test 1 "Get available tables failed (HTTP $HTTP_CODE)"
fi

# Test 6: Create booking as customer
echo -e "\n${YELLOW}[TEST 6] Create Booking${NC}"
if [ -n "$CUSTOMER_TOKEN" ] && [ -n "$TABLE_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/bookings" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CUSTOMER_TOKEN" \
        -d "{\"numberOfGuests\":4,\"tableId\":$TABLE_ID,\"bookingDate\":\"$TOMORROW\",\"timeSlot\":\"19:00-21:00\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        print_test 0 "Create booking successful"
    else
        print_test 1 "Create booking failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Create booking skipped (missing token or table ID)"
fi

# Test 7: Get my bookings
echo -e "\n${YELLOW}[TEST 7] Get My Bookings${NC}"
if [ -n "$CUSTOMER_TOKEN" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/bookings/my" \
        -H "Authorization: Bearer $CUSTOMER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        BOOKING_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        print_test 0 "Get my bookings successful (Found booking ID: $BOOKING_ID)"
    else
        print_test 1 "Get my bookings failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Get my bookings skipped (missing token)"
fi

# Test 8: Admin - Get all bookings
echo -e "\n${YELLOW}[TEST 8] Admin - Get All Bookings${NC}"
if [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/bookings" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_test 0 "Admin get all bookings successful"
    else
        print_test 1 "Admin get all bookings failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Admin get all bookings skipped (missing token)"
fi

# Test 9: Admin - Create new table
echo -e "\n${YELLOW}[TEST 9] Admin - Create Table${NC}"
if [ -n "$ADMIN_TOKEN" ]; then
    # Generate a short unique table number (max 10 chars)
    UNIQUE_NUM=$(date +%s | tail -c 5)
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/tables" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{\"tableNumber\":\"T$UNIQUE_NUM\",\"capacity\":6}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        NEW_TABLE_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | cut -d':' -f2)
        print_test 0 "Admin create table successful (ID: $NEW_TABLE_ID)"
    else
        print_test 1 "Admin create table failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Admin create table skipped (missing token)"
fi

# Test 10: Admin - Update table
echo -e "\n${YELLOW}[TEST 10] Admin - Update Table${NC}"
if [ -n "$ADMIN_TOKEN" ] && [ -n "$NEW_TABLE_ID" ]; then
    # Generate a short unique table number for update
    UPDATE_NUM=$(date +%s | tail -c 5)
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/tables/$NEW_TABLE_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "{\"tableNumber\":\"U$UPDATE_NUM\",\"capacity\":8}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
        print_test 0 "Admin update table successful"
    else
        print_test 1 "Admin update table failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Admin update table skipped (missing token or table ID)"
fi

# Test 11: Cancel booking
echo -e "\n${YELLOW}[TEST 11] Cancel Booking${NC}"
if [ -n "$CUSTOMER_TOKEN" ] && [ -n "$BOOKING_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/bookings/$BOOKING_ID" \
        -H "Authorization: Bearer $CUSTOMER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
        print_test 0 "Cancel booking successful"
    else
        print_test 1 "Cancel booking failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Cancel booking skipped (missing token or booking ID)"
fi

# Test 12: Admin - Delete table
echo -e "\n${YELLOW}[TEST 12] Admin - Delete Table${NC}"
if [ -n "$ADMIN_TOKEN" ] && [ -n "$NEW_TABLE_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/tables/$NEW_TABLE_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
        print_test 0 "Admin delete table successful"
    else
        print_test 1 "Admin delete table failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Admin delete table skipped (missing token or table ID)"
fi

# Test 13: Error handling - Invalid login
echo -e "\n${YELLOW}[TEST 13] Error Handling - Invalid Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@test.com","password":"wrongpassword"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    print_test 0 "Invalid login returns error correctly"
else
    print_test 1 "Invalid login error handling failed (HTTP $HTTP_CODE)"
fi

# Test 14: Error handling - Unauthorized access
echo -e "\n${YELLOW}[TEST 14] Error Handling - Unauthorized Access${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/bookings/my")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    print_test 0 "Unauthorized access blocked correctly"
else
    print_test 1 "Unauthorized access handling failed (HTTP $HTTP_CODE)"
fi

# Test 15: Error handling - Customer cannot access admin endpoints
echo -e "\n${YELLOW}[TEST 15] Error Handling - Customer Cannot Access Admin Endpoints${NC}"
if [ -n "$CUSTOMER_TOKEN" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/tables" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CUSTOMER_TOKEN" \
        -d '{"tableNumber":"HACK","capacity":2}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "403" ]; then
        print_test 0 "Customer blocked from admin endpoints correctly"
    else
        print_test 1 "Customer admin access handling failed (HTTP $HTTP_CODE)"
    fi
else
    print_test 1 "Customer admin access test skipped (missing token)"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
