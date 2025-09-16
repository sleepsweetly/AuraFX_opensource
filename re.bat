@echo off
setlocal enabledelayedexpansion

:: Debug: Script bilgileri
echo Script adi: %~nx0
echo Script dizini: %~dp0
echo Calisma dizini: %CD%
echo.
echo Devam etmek icin ENTER...
pause

chcp 65001 >nul
echo ========================================
echo    AuraFX Build and Deploy Automation
echo ========================================
echo.

:: Set colors for better output
set GREEN=[92m
set YELLOW=[93m
set RED=[91m
set BLUE=[94m
set RESET=[0m

:: Configuration
set PROJECT_DIR=.
set DEPLOY_DIR=AuraFX
set COMMIT_MESSAGE=Update build files - %date% %time%

echo !BLUE!Step 1: Checking current directory...!RESET!

if not exist "package.json" (
    echo !RED!Error: package.json not found!!RESET!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo !GREEN!✓ Project directory found!RESET!
echo.

echo !BLUE!Step 2: Installing npm packages...!RESET!

:: npm komutunu test et
echo !YELLOW!NPM versiyonu kontrol ediliyor...!RESET!
cmd /c "npm --version"
set npm_version_error=%errorlevel%

if !npm_version_error! neq 0 (
    echo !RED!Error: NPM bulunamadi!!RESET!
    popd
    pause
    exit /b 1
)

echo !YELLOW!NPM install baslatiiliyor...!RESET!
cmd /c "npm install --legacy-peer-deps"
set npm_install_error=%errorlevel%

if !npm_install_error! neq 0 (
    echo !RED!Error: npm install failed! Error code: !npm_install_error!!RESET!
    echo !YELLOW!Devam etmek icin bir tusa basin...!RESET!
    pause
    exit /b 1
)
echo !GREEN!✓ NPM packages installed successfully!RESET!
echo.

echo !BLUE!Step 3: Building the project (for testing)...!RESET!
echo !YELLOW!Build baslatiiliyor...!RESET!
cmd /c "npm run build"
set build_error=%errorlevel%
if !build_error! neq 0 (
    echo !RED!Error: Build failed! Error code: !build_error!!RESET!
    echo !YELLOW!Devam etmek icin bir tusa basin...!RESET!
    pause
    exit /b 1
)
echo !GREEN!✓ Build completed successfully!RESET!
echo.

echo !BLUE!Step 4: Preparing deployment directory...!RESET!
if not exist "!DEPLOY_DIR!" (
    echo !YELLOW!Deploy directory not found. Cloning from GitHub...!RESET!
    git clone https://github.com/sleepsweetly/AuraFX.git
    if !errorlevel! neq 0 (
        echo !RED!Error: Failed to clone repository!!RESET!
        pause
        exit /b 1
    )
    echo !GREEN!✓ Repository cloned successfully!RESET!
) else (
    echo !YELLOW!Deploy directory already exists. Updating...!RESET!
    pushd "!DEPLOY_DIR!"

    :: Debug git durumu
    echo.
    echo !RED!--- GIT DEBUG ---!RESET!
    echo !YELLOW!Git dizini kontrol ediliyor...!RESET!
    if exist ".git" (
        echo !GREEN!Git repository mevcut!RESET!
    ) else (
        echo !RED!Git repository bulunamadi!!RESET!
    )
    echo !YELLOW!Git status:!RESET!
    git status --porcelain
    echo !YELLOW!Devam etmek icin bir tusa basin...!RESET!
    pause
    echo !RED!--- GIT DEBUG SONU ---!RESET!
    echo.

    git pull origin main
    if !errorlevel! neq 0 (
        echo !RED!Error: Failed to pull latest changes!!RESET!
        popd
        pause
        exit /b 1
    )
    echo !GREEN!✓ Repository updated successfully!RESET!
    popd
)

echo !GREEN!✓ Deploy directory ready!RESET!
echo.

echo !BLUE!Step 5: Copying source code files...!RESET!
pushd "!DEPLOY_DIR!"

:: Remove old files (except .git)
echo !YELLOW!Eski dosyalar temizleniyor...!RESET!
for /f "delims=" %%i in ('dir /b /a-d 2^>nul') do (
    if not "%%i"==".git" del /q "%%i" 2>nul
)
for /f "delims=" %%i in ('dir /b /ad 2^>nul') do (
    if not "%%i"==".git" rmdir /s /q "%%i" 2>nul
)

:: Force remove public/extensions if it exists
if exist "public\extensions" (
    echo !YELLOW!Removing public\extensions...!RESET!
    rmdir /s /q "public\extensions" 2>nul
)

:: Create exclude list first
echo !YELLOW!Exclude listesi olusturuluyor...!RESET!
echo node_modules > exclude_list.txt
echo .next >> exclude_list.txt
echo out >> exclude_list.txt
echo .git >> exclude_list.txt
echo *.zip >> exclude_list.txt
echo AuraFX >> exclude_list.txt
echo re.bat >> exclude_list.txt
echo exclude_list.txt >> exclude_list.txt
echo *.log >> exclude_list.txt
echo .DS_Store >> exclude_list.txt
echo Thumbs.db >> exclude_list.txt
echo public\extensions >> exclude_list.txt

:: Copy all source files (excluding node_modules and .next)
echo !YELLOW!Kaynak dosyalar kopyalaniyor...!RESET!
echo !YELLOW!Exclude listesi icerigi:!RESET!
type exclude_list.txt
echo.
xcopy "..\*" "." /s /e /y /q /exclude:exclude_list.txt
set copy_result=%errorlevel%
echo !YELLOW!Copy result: !copy_result!!RESET!
if !copy_result! neq 0 (
    echo !RED!Error: Failed to copy source files! Error code: !copy_result!!RESET!
    echo !YELLOW!Trying alternative copy method...!RESET!
    robocopy ".." "." /E /XD node_modules .next out .git AuraFX public\extensions /XF *.zip *.log re.bat exclude_list.txt
    if !errorlevel! gtr 7 (
        echo !RED!Error: Alternative copy also failed!!RESET!
        popd
        pause
        exit /b 1
    )
    echo !GREEN!✓ Alternative copy method successful!RESET!
)

echo !GREEN!✓ Source files copied successfully!RESET!
echo.

echo !BLUE!Step 6: Git operations...!RESET!
:: Add all changes
git add .
if !errorlevel! neq 0 (
    echo !RED!Error: Failed to add files to git!!RESET!
    popd
    pause
    exit /b 1
)
echo !GREEN!✓ Files added to git!RESET!

:: Commit changes (sadece değişiklik varsa)
git diff --cached --quiet
if !errorlevel! neq 0 (
    git commit -m "!COMMIT_MESSAGE!"
    if !errorlevel! neq 0 (
        echo !RED!Error: Failed to commit changes!!RESET!
        popd
        pause
        exit /b 1
    )
    echo !GREEN!✓ Changes committed!RESET!
    
    :: Push to GitHub
    echo !YELLOW!Pushing to GitHub...!RESET!
    git push origin main
    if !errorlevel! neq 0 (
        echo !RED!Error: Failed to push to GitHub!!RESET!
        popd
        pause
        exit /b 1
    )
    echo !GREEN!✓ Changes pushed to GitHub!RESET!
) else (
    echo !YELLOW!No changes to commit!RESET!
)

popd
echo.

echo !BLUE!Step 7: Deployment Summary!RESET!
echo !GREEN!========================================!RESET!
echo !GREEN!✓ Build completed successfully!RESET!
echo !GREEN!✓ Source code deployed to repository!RESET!
echo !GREEN!✓ Changes pushed to GitHub!RESET!
echo !GREEN!✓ Vercel will auto-deploy with full features!RESET!
echo !GREEN!========================================!RESET!
echo.

echo !BLUE!Live site: https://aurafx.online!RESET!
echo !BLUE!Repository: https://github.com/sleepsweetly/AuraFX!RESET!
echo !BLUE!Vercel Dashboard: https://vercel.com/dashboard!RESET!
echo.

echo !YELLOW!Deployment process completed!!RESET!
echo !YELLOW!Vercel will automatically detect the changes and deploy within 2-5 minutes.!RESET!
echo !YELLOW!Now you can use API Routes, WebSockets, and all server features!!RESET!
echo.

pause