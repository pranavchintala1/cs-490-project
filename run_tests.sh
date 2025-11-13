#!/bin/bash

# Test Runner Script for CS-490 Project
# Run all tests for frontend and backend

set -e  # Exit on any error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   CS-490 Project Test Runner            ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""

# Parse command line arguments
FRONTEND_ONLY=false
BACKEND_ONLY=false
COVERAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --help)
            echo "Usage: ./run_tests.sh [options]"
            echo ""
            echo "Options:"
            echo "  --frontend-only   Run only frontend tests"
            echo "  --backend-only    Run only backend tests"
            echo "  --coverage        Include coverage reports"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Frontend Tests
if [ "$BACKEND_ONLY" = false ]; then
    echo -e "${YELLOW}Running Frontend Tests...${NC}"
    cd frontend
    
    if [ "$COVERAGE" = true ]; then
        npm test -- --coverage --watchAll=false
    else
        npm test -- --watchAll=false
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend tests passed${NC}"
    else
        echo -e "${RED}✗ Frontend tests failed${NC}"
        exit 1
    fi
    cd ..
    echo ""
fi

# Backend Tests
if [ "$FRONTEND_ONLY" = false ]; then
    echo -e "${YELLOW}Running Backend Tests...${NC}"
    cd backend
    
    if [ "$COVERAGE" = true ]; then
        python -m pytest test_backend_comprehensive.py --cov=. --cov-report=term-missing
    else
        python -m pytest test_backend_comprehensive.py -v
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend tests passed${NC}"
    else
        echo -e "${RED}✗ Backend tests failed${NC}"
        exit 1
    fi
    cd ..
    echo ""
fi

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   All Tests Passed Successfully! ✓      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
