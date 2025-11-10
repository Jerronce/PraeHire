#!/bin/bash
set -e

echo "🚀 PRAEHIRE COMPLETE FIX"
echo "========================"
echo ""
echo "This script will:"
echo "1. Set up Firebase Functions with secure API"
echo "2. Fix navigation issues"
echo "3. Update payment integration"
echo "4. Deploy everything"
echo ""

# Get the API key from environment or prompt
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  Please set GEMINI_API_KEY environment variable first:"
    echo "export GEMINI_API_KEY='your-key-here'"
    echo ""
    echo "Or paste it now:"
    read -p "API Key: " GEMINI_API_KEY
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ No API key provided!"
    exit 1
fi

echo "✅ API Key received"
echo ""

# Step 1: Create Firebase Functions structure
echo "📦 Step 1: Creating Firebase Functions..."
mkdir -p functions

# Create package.json
cat > functions/package.json << 'PKGEND'
{
  "name": "praehire-functions",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "firebase-functions": "^4.4.1",
    "firebase-admin": "^11.10.1",
    "node-fetch": "^2.6.12"
  }
}
PKGEND

echo "✓ Created package.json"

