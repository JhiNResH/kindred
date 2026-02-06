#!/bin/bash

# Test URL Search Feature
echo "🔍 Testing URL Search Feature"
echo "============================="
echo

BASE_URL="http://localhost:3001/api/search"

# Test 1: Twitter URL
echo "1️⃣ Testing Twitter URL:"
echo "   Input: https://twitter.com/Uniswap"
curl -s "$BASE_URL?q=https://twitter.com/Uniswap&analyze=true" | jq '.aiAnalysis.queryType, .aiAnalysis.data.name'
echo

# Test 2: Project Website
echo "2️⃣ Testing Website URL:"
echo "   Input: https://uniswap.org"
curl -s "$BASE_URL?q=https://uniswap.org&analyze=true" | jq '.aiAnalysis.queryType, .aiAnalysis.data.name'
echo

# Test 3: Contract Address
echo "3️⃣ Testing Contract Address:"
echo "   Input: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
curl -s "$BASE_URL?q=0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984&analyze=true" | jq '.aiAnalysis.queryType, .aiAnalysis.data.name'
echo

# Test 4: Direct Name
echo "4️⃣ Testing Direct Name:"
echo "   Input: Curve"
curl -s "$BASE_URL?q=Curve" | jq '.projects[0].name, .projects[0].category'
echo

echo "✅ URL Search Tests Complete!"
