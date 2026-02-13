#!/bin/bash

# E2E Testing with Docker (Local Development)
# This script runs Playwright E2E tests in Docker against locally running apps
# ensuring consistent test environment across different machines

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_COMPOSE_FILE="$ROOT_DIR/docker-compose.local.yml"

# Default values
COMPONENT=""
CLEANUP=true
VERBOSE=false
USE_DOCKER=false
UPDATE_SNAPSHOTS=false
FAILED_ONLY=false
PLAYWRIGHT_ARGS=""

# Help function
show_help() {
    cat << EOF
Usage: $0 [OPTIONS] [COMPONENT] [-- PLAYWRIGHT_ARGS]

Run Playwright E2E tests locally or in Docker

COMPONENT:
    ui      Run UI (Storybook) E2E tests
    web     Run Web application E2E tests
    all     Run all E2E tests (default)

    Note: Component will be auto-detected from test file paths if not specified

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Verbose output
    -d, --docker    Use Docker for testing (optional isolation)
    --update        Update screenshots (only in Docker mode)
    --failed        Run only previously failed tests
    --no-cleanup    Don't cleanup containers after tests (Docker mode)

PLAYWRIGHT_ARGS:
    Any arguments after -- will be passed directly to Playwright

EXAMPLES:
    $0                  # Run all E2E tests locally
    $0 ui              # Run only UI E2E tests locally
    $0 web             # Run only Web E2E tests locally
    $0 --docker ui     # Run UI tests in Docker
    $0 --docker --update ui  # Update UI screenshots in Docker
    $0 --failed ui     # Run only previously failed UI tests locally
    $0 --docker --failed ui  # Run only previously failed UI tests in Docker
    $0 --verbose web   # Run Web tests with verbose output
    $0 ui -- packages/ui/src/components/Logo/Logo.e2e.ts  # Run specific test file
    $0 -- packages/ui/src/components/Logo/Logo.e2e.ts    # Auto-detect UI from path
    $0 --docker ui -- -g "Logo Business"  # Run tests matching pattern in Docker
    $0 --docker -- packages/ui/src/components/Logo/Logo.e2e.ts  # Auto-detect in Docker
    $0 ui -- --project=webkit  # Run tests only in webkit browser

PREREQUISITES:
    Local mode: Apps must be running (pnpm dev)
    Docker mode: Docker must be available

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--docker)
            USE_DOCKER=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --update)
            UPDATE_SNAPSHOTS=true
            shift
            ;;
        --failed)
            FAILED_ONLY=true
            shift
            ;;
        --no-cleanup)
            CLEANUP=false
            shift
            ;;
        ui|web|all)
            COMPONENT="$1"
            shift
            ;;
        --)
            # Everything after -- is passed to Playwright
            shift
            PLAYWRIGHT_ARGS="$@"
            break
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Auto-detect component from test file path if not specified and args provided
if [[ -z "$COMPONENT" && -n "$PLAYWRIGHT_ARGS" ]]; then
    if [[ "$PLAYWRIGHT_ARGS" == *"packages/ui/"* ]]; then
        COMPONENT="ui"
        echo -e "${YELLOW}Auto-detected component: ui (based on test path)${NC}"
        # Convert full path to relative path for UI package
        PLAYWRIGHT_ARGS=$(echo "$PLAYWRIGHT_ARGS" | sed 's|packages/ui/||g')
        echo -e "${YELLOW}Converted path: $PLAYWRIGHT_ARGS${NC}"
    elif [[ "$PLAYWRIGHT_ARGS" == *"apps/web/"* ]]; then
        COMPONENT="web"
        echo -e "${YELLOW}Auto-detected component: web (based on test path)${NC}"
        # Convert full path to relative path for Web package
        PLAYWRIGHT_ARGS=$(echo "$PLAYWRIGHT_ARGS" | sed 's|apps/web/||g')
        echo -e "${YELLOW}Converted path: $PLAYWRIGHT_ARGS${NC}"
    fi
fi

# Set default component if still not specified
if [[ -z "$COMPONENT" ]]; then
    COMPONENT="all"
fi

# Validate --update flag
if [[ "$UPDATE_SNAPSHOTS" == "true" && "$USE_DOCKER" == "false" ]]; then
    echo -e "${RED}❌ --update flag can only be used with --docker${NC}"
    exit 1
fi

if [[ "$USE_DOCKER" == "true" ]]; then
    if [[ "$UPDATE_SNAPSHOTS" == "true" ]]; then
        echo -e "${BLUE}🐳 Starting E2E screenshot update with Docker${NC}"
    else
        echo -e "${BLUE}🐳 Starting E2E tests with Docker${NC}"
    fi
else
    echo -e "${BLUE}🧪 Starting E2E tests locally${NC}"
fi
echo -e "Component: ${YELLOW}$COMPONENT${NC}"
echo -e "Use Docker: ${YELLOW}$USE_DOCKER${NC}"
echo -e "Update Screenshots: ${YELLOW}$UPDATE_SNAPSHOTS${NC}"
echo -e "Failed Only: ${YELLOW}$FAILED_ONLY${NC}"
echo -e "Verbose: ${YELLOW}$VERBOSE${NC}"

# Add --last-failed flag if requested
if [[ "$FAILED_ONLY" == "true" ]]; then
    if [[ -n "$PLAYWRIGHT_ARGS" ]]; then
        PLAYWRIGHT_ARGS="--last-failed $PLAYWRIGHT_ARGS"
    else
        PLAYWRIGHT_ARGS="--last-failed"
    fi
fi

if [[ -n "$PLAYWRIGHT_ARGS" ]]; then
    echo -e "Playwright Args: ${YELLOW}$PLAYWRIGHT_ARGS${NC}"
fi
echo ""

# Change to root directory
cd "$ROOT_DIR"

# Check Docker availability if needed
if [[ "$USE_DOCKER" == "true" ]]; then
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not available${NC}"
        exit 1
    fi

    # Check if docker-compose.local.yml exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        echo -e "${RED}❌ Docker Compose file not found: $DOCKER_COMPOSE_FILE${NC}"
        exit 1
    fi
fi

# Function to cleanup containers
cleanup() {
    if [[ "$USE_DOCKER" == "true" && "$CLEANUP" == "true" ]]; then
        echo -e "${YELLOW}🧹 Cleaning up containers...${NC}"
        # Determine profile based on mode
        local profile="$COMPONENT"
        if [[ "$UPDATE_SNAPSHOTS" == "true" ]]; then
            if [[ "$COMPONENT" == "ui" ]]; then
                profile="ui-update"
            elif [[ "$COMPONENT" == "web" ]]; then
                profile="web-update"
            elif [[ "$COMPONENT" == "all" ]]; then
                # Clean both update profiles
                docker-compose -f "$DOCKER_COMPOSE_FILE" --profile "ui-update" down --volumes --remove-orphans 2>/dev/null || true
                docker-compose -f "$DOCKER_COMPOSE_FILE" --profile "web-update" down --volumes --remove-orphans 2>/dev/null || true
                return
            fi
        fi
        docker-compose -f "$DOCKER_COMPOSE_FILE" --profile "$profile" down --volumes --remove-orphans 2>/dev/null || true
    elif [[ "$USE_DOCKER" == "true" ]]; then
        echo -e "${YELLOW}⚠️ Skipping cleanup (--no-cleanup specified)${NC}"
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT

# Function to check if services are running (local mode)
check_local_services() {
    echo -e "${BLUE}🔍 Checking if local services are running...${NC}"

    if [[ "$COMPONENT" == "ui" || "$COMPONENT" == "all" ]]; then
        echo -e "${BLUE}Checking Storybook on http://localhost:6006...${NC}"
        if ! curl -f http://localhost:6006 >/dev/null 2>&1; then
            echo -e "${RED}❌ Storybook is not running on http://localhost:6006${NC}"
            echo -e "${YELLOW}Please start it with: pnpm --filter=@wallarm-org/ui dev${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Storybook is running${NC}"
    fi

    if [[ "$COMPONENT" == "web" || "$COMPONENT" == "all" ]]; then
        echo -e "${BLUE}Checking Web app on http://localhost:3000...${NC}"
        if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${RED}❌ Web app is not running on http://localhost:3000${NC}"
            echo -e "${YELLOW}Please start it with: pnpm --filter=@wallarm-org/web dev${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Web app is running${NC}"
    fi
}

# Function to run tests locally
run_local_tests() {
    local component=$1
    echo -e "${BLUE}🧪 Running $component E2E tests locally...${NC}"

    case $component in
        ui)
            echo -e "${BLUE}Running UI E2E tests...${NC}"
            local e2e_cmd="e2e"
            if [[ "$FAILED_ONLY" == "true" ]]; then
                e2e_cmd="e2e:failed"
            fi
            if [[ "$VERBOSE" == "true" ]]; then
                pnpm --filter=@wallarm-org/ui $e2e_cmd $PLAYWRIGHT_ARGS
            else
                pnpm --filter=@wallarm-org/ui $e2e_cmd $PLAYWRIGHT_ARGS > /dev/null 2>&1
            fi
            ;;
        web)
            echo -e "${BLUE}Running Web E2E tests...${NC}"
            local e2e_cmd="e2e"
            if [[ "$FAILED_ONLY" == "true" ]]; then
                e2e_cmd="e2e:failed"
            fi
            if [[ "$VERBOSE" == "true" ]]; then
                pnpm --filter=@wallarm-org/web $e2e_cmd $PLAYWRIGHT_ARGS
            else
                pnpm --filter=@wallarm-org/web $e2e_cmd $PLAYWRIGHT_ARGS > /dev/null 2>&1
            fi
            ;;
        all)
            echo -e "${BLUE}Running UI E2E tests...${NC}"
            local e2e_cmd="e2e"
            if [[ "$FAILED_ONLY" == "true" ]]; then
                e2e_cmd="e2e:failed"
            fi
            if [[ "$VERBOSE" == "true" ]]; then
                pnpm --filter=@wallarm-org/ui $e2e_cmd $PLAYWRIGHT_ARGS
            else
                pnpm --filter=@wallarm-org/ui $e2e_cmd $PLAYWRIGHT_ARGS > /dev/null 2>&1
            fi

            echo -e "${BLUE}Running Web E2E tests...${NC}"
            if [[ "$VERBOSE" == "true" ]]; then
                pnpm --filter=@wallarm-org/web $e2e_cmd $PLAYWRIGHT_ARGS
            else
                pnpm --filter=@wallarm-org/web $e2e_cmd $PLAYWRIGHT_ARGS > /dev/null 2>&1
            fi
            ;;
    esac
}

# Function to run tests in Docker
run_docker_tests() {
    local component=$1
    if [[ "$UPDATE_SNAPSHOTS" == "true" ]]; then
        echo -e "${BLUE}🐳 Updating $component screenshots in Docker...${NC}"
    else
        echo -e "${BLUE}🐳 Running $component E2E tests in Docker...${NC}"
    fi

    # Determine profile based on mode and component
    local profile="$component"
    if [[ "$UPDATE_SNAPSHOTS" == "true" ]]; then
        if [[ "$component" == "ui" ]]; then
            profile="ui-update"
        elif [[ "$component" == "web" ]]; then
            profile="web-update"
        elif [[ "$component" == "all" ]]; then
            # Set Playwright args as environment variable for Docker containers
            if [[ -n "$PLAYWRIGHT_ARGS" ]]; then
                export PLAYWRIGHT_ARGS
            fi

            # Run both update profiles sequentially
            echo -e "${BLUE}🚀 Starting UI screenshot update...${NC}"
            local ui_cmd="docker-compose -f $DOCKER_COMPOSE_FILE --profile ui-update"
            if [[ "$VERBOSE" == "true" ]]; then
                $ui_cmd up --build --abort-on-container-exit
            else
                $ui_cmd up --build --abort-on-container-exit 2>/dev/null
            fi

            echo -e "${BLUE}🚀 Starting Web screenshot update...${NC}"
            local web_cmd="docker-compose -f $DOCKER_COMPOSE_FILE --profile web-update"
            if [[ "$VERBOSE" == "true" ]]; then
                $web_cmd up --build --abort-on-container-exit
            else
                $web_cmd up --build --abort-on-container-exit 2>/dev/null
            fi
            return
        fi
    fi

    # Set Docker Compose command with appropriate profile
    local compose_cmd="docker-compose -f $DOCKER_COMPOSE_FILE --profile $profile"

    # Set Playwright args as environment variable for Docker containers
    if [[ -n "$PLAYWRIGHT_ARGS" ]]; then
        export PLAYWRIGHT_ARGS
    fi

    echo -e "${BLUE}🚀 Starting Docker containers...${NC}"
    if [[ "$VERBOSE" == "true" ]]; then
        $compose_cmd up --build --abort-on-container-exit
    else
        $compose_cmd up --build --abort-on-container-exit 2>/dev/null
    fi
}

# Main execution
main() {
    # Export Playwright args for Docker containers
    if [[ -n "$PLAYWRIGHT_ARGS" ]]; then
        export PLAYWRIGHT_ARGS
    fi

    # Ensure we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -f "pnpm-workspace.yaml" ]]; then
        echo -e "${RED}❌ Not in a valid pnpm workspace directory${NC}"
        exit 1
    fi

    if [[ "$USE_DOCKER" == "true" ]]; then
        # Docker mode - run in containers
        run_docker_tests "$COMPONENT"
    else
        # Local mode - check services are running and run locally
        check_local_services
        run_local_tests "$COMPONENT"
    fi

    if [[ "$UPDATE_SNAPSHOTS" == "true" ]]; then
        echo -e "${GREEN}✅ Screenshot updates completed successfully!${NC}"
    else
        echo -e "${GREEN}✅ E2E tests completed successfully!${NC}"
    fi
}

# Run main function
main