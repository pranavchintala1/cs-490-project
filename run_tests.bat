@echo off
REM Test Runner Script for CS-490 Project (Windows)
REM Run all tests for frontend and backend

setlocal enabledelayedexpansion

set "FRONTEND_ONLY=false"
set "BACKEND_ONLY=false"
set "COVERAGE=false"

REM Parse arguments
:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--frontend-only" (
    set "FRONTEND_ONLY=true"
    shift
    goto parse_args
)
if "%~1"=="--backend-only" (
    set "BACKEND_ONLY=true"
    shift
    goto parse_args
)
if "%~1"=="--coverage" (
    set "COVERAGE=true"
    shift
    goto parse_args
)
if "%~1"=="--help" (
    echo Usage: run_tests.bat [options]
    echo.
    echo Options:
    echo   --frontend-only   Run only frontend tests
    echo   --backend-only    Run only backend tests
    echo   --coverage        Include coverage reports
    echo   --help           Show this help message
    exit /b 0
)
shift
goto parse_args

:end_parse
cls
echo.
echo ======================================
echo    CS-490 Project Test Runner
echo ======================================
echo.

REM Frontend Tests
if NOT "%BACKEND_ONLY%"=="true" (
    echo Running Frontend Tests...
    cd frontend
    
    if "%COVERAGE%"=="true" (
        call npm test -- --coverage --watchAll=false
    ) else (
        call npm test -- --watchAll=false
    )
    
    if errorlevel 1 (
        echo Frontend tests failed!
        exit /b 1
    ) else (
        echo [OK] Frontend tests passed
    )
    cd ..
    echo.
)

REM Backend Tests
if NOT "%FRONTEND_ONLY%"=="true" (
    echo Running Backend Tests...
    cd backend
    
    if "%COVERAGE%"=="true" (
        python -m pytest test_backend_comprehensive.py --cov=. --cov-report=term-missing
    ) else (
        python -m pytest test_backend_comprehensive.py -v
    )
    
    if errorlevel 1 (
        echo Backend tests failed!
        exit /b 1
    ) else (
        echo [OK] Backend tests passed
    )
    cd ..
    echo.
)

echo ======================================
echo    All Tests Passed Successfully!
echo ======================================
