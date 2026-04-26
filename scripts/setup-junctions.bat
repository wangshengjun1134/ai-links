@echo off
echo ========================================
echo AI Links 目录链接配置脚本
echo ========================================
echo.

cd /d "%~dp0.."

echo 创建 src/content 链接...
if exist "src\content" (
    echo [警告] src\content 已存在，跳过
) else (
    mklink /J "src\content" "ai-links-data\content"
)

echo 创建 public/product-favicons 链接...
if exist "public\product-favicons" (
    echo [警告] public\product-favicons 已存在，跳过
) else (
    mklink /J "public\product-favicons" "ai-links-data\favicons\product-favicons"
)

echo 创建 public/agents-favicons 链接...
if exist "public\agents-favicons" (
    echo [警告] public\agents-favicons 已存在，跳过
) else (
    mklink /J "public\agents-favicons" "ai-links-data\favicons\agents-favicons"
)

echo 创建 public/aihub-favicons 链接...
if exist "public\aihub-favicons" (
    echo [警告] public\aihub-favicons 已存在，跳过
) else (
    mklink /J "public\aihub-favicons" "ai-links-data\favicons\aihub-favicons"
)

echo 创建 public/mcp-favicons 链接...
if exist "public\mcp-favicons" (
    echo [警告] public\mcp-favicons 已存在，跳过
) else (
    mklink /J "public\mcp-favicons" "ai-links-data\favicons\mcp-favicons"
)

echo.
echo ========================================
echo 配置完成！
echo ========================================
pause