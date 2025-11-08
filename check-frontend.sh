#!/bin/bash
# Frontend Diagnostic Script
# This script checks if the frontend is properly deployed and accessible

FRONTEND_HOST="${FRONTEND_HOST:-46.101.40.110}"

echo "=== Frontend Diagnostic Check ==="
echo ""

echo "1. Testing HTTP connection..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$FRONTEND_HOST)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✓ HTTP connection successful (Status: $HTTP_STATUS)"
else
    echo "   ✗ HTTP connection failed (Status: $HTTP_STATUS)"
fi

echo ""
echo "2. Checking HTML content..."
HTML_CONTENT=$(curl -s http://$FRONTEND_HOST)
if echo "$HTML_CONTENT" | grep -q "id=\"root\""; then
    echo "   ✓ HTML contains root element"
else
    echo "   ✗ HTML missing root element"
fi

if echo "$HTML_CONTENT" | grep -q "index-BQR-cHhj.js"; then
    echo "   ✓ JavaScript bundle referenced in HTML"
    JS_FILE=$(echo "$HTML_CONTENT" | grep -o 'src="[^"]*\.js"' | sed 's/src="//;s/"//')
    echo "   JavaScript file: $JS_FILE"
else
    echo "   ✗ JavaScript bundle not found in HTML"
fi

echo ""
echo "3. Testing JavaScript bundle accessibility..."
JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$FRONTEND_HOST/assets/index-BQR-cHhj.js)
if [ "$JS_STATUS" = "200" ]; then
    JS_SIZE=$(curl -s -o /dev/null -w "%{size_download}" http://$FRONTEND_HOST/assets/index-BQR-cHhj.js)
    echo "   ✓ JavaScript bundle accessible (Status: $JS_STATUS, Size: $JS_SIZE bytes)"
else
    echo "   ✗ JavaScript bundle not accessible (Status: $JS_STATUS)"
fi

echo ""
echo "4. Testing CSS accessibility..."
CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$FRONTEND_HOST/assets/index-D9BMvGgV.css)
if [ "$CSS_STATUS" = "200" ]; then
    echo "   ✓ CSS file accessible (Status: $CSS_STATUS)"
else
    echo "   ✗ CSS file not accessible (Status: $CSS_STATUS)"
fi

echo ""
echo "5. Checking container status..."
if command -v kamal &> /dev/null; then
    echo "   Running: kamal app details"
    export FRONTEND_HOST=$FRONTEND_HOST
    kamal app details 2>&1 | grep -E "(CONTAINER|STATUS|Up|running)" | head -5
else
    echo "   Kamal not found, skipping container check"
fi

echo ""
echo "6. Testing backend API connectivity..."
BACKEND_URL="https://microblog-be.davidslv.uk/api/v1/health"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BACKEND_URL" 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✓ Backend API is accessible"
elif [ "$BACKEND_STATUS" = "000" ]; then
    echo "   ⚠ Backend API connection failed (timeout or SSL error)"
    echo "   This may cause the frontend to show errors in the browser"
else
    echo "   ⚠ Backend API returned status: $BACKEND_STATUS"
fi

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "If all checks pass but you still see issues in the browser:"
echo "1. Open browser Developer Tools (F12)"
echo "2. Check the Console tab for JavaScript errors"
echo "3. Check the Network tab to see if assets are loading"
echo "4. Look for CORS errors or API connection failures"
echo ""
echo "To view the frontend, open: http://$FRONTEND_HOST"



