@echo off
echo Starting OpenAI MCP Client...
echo.
echo Make sure you have set your environment variables:
echo - OPENAI_API_KEY
echo - OPENAI_BASE_URL  
echo - OPENAI_MODEL
echo.

npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Starting MCP server...
echo Press Ctrl+C to stop the server
npm run start
pause