#!/bin/bash

echo "Testing Delete API..."
echo ""

echo "Test 1: Missing wallet_address (should return 400)"
curl -s -X POST http://localhost:3000/api/share/test-id/delete \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo ""
echo "Test 2: Non-existent share (should return 404)"
curl -s -X POST http://localhost:3000/api/share/non-existent-id-12345/delete \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"0xTest123"}' | jq '.'

echo ""
echo "If you see proper error messages above (not Internal Server Error), the migration worked!"

