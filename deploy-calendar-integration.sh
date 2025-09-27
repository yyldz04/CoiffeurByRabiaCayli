#!/bin/bash

# Calendar Integration Deployment Script
# This script helps deploy the calendar integration to your environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_error "NEXT_PUBLIC_SUPABASE_URL is not set"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_error "SUPABASE_SERVICE_ROLE_KEY is not set"
        exit 1
    fi
    
    print_success "Environment variables are set"
}

# Function to run database migration
run_database_migration() {
    print_status "Running database migration..."
    
    if [ ! -f "calendar-schema.sql" ]; then
        print_error "calendar-schema.sql file not found"
        exit 1
    fi
    
    print_warning "Please run the following SQL in your Supabase SQL editor:"
    echo "---"
    cat calendar-schema.sql
    echo "---"
    
    read -p "Press Enter after running the SQL migration..."
    print_success "Database migration completed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        if command_exists npm; then
            npm install
            print_success "Dependencies installed with npm"
        elif command_exists yarn; then
            yarn install
            print_success "Dependencies installed with yarn"
        else
            print_error "Neither npm nor yarn found"
            exit 1
        fi
    else
        print_warning "No package.json found, skipping dependency installation"
    fi
}

# Function to build the application
build_application() {
    print_status "Building application..."
    
    if command_exists npm; then
        npm run build
    elif command_exists yarn; then
        yarn build
    else
        print_error "No package manager found"
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    if [ -f "test-calendar-api.js" ]; then
        if command_exists node; then
            print_warning "Update the BASE_URL and TEST_TOKEN in test-calendar-api.js first"
            read -p "Press Enter to run tests (or Ctrl+C to skip)..."
            node test-calendar-api.js
            print_success "Tests completed"
        else
            print_warning "Node.js not found, skipping tests"
        fi
    else
        print_warning "Test file not found, skipping tests"
    fi
}

# Function to create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create a deployment directory
    DEPLOY_DIR="calendar-integration-deploy"
    mkdir -p "$DEPLOY_DIR"
    
    # Copy necessary files
    cp -r app/api/calendar "$DEPLOY_DIR/"
    cp -r app/api/caldav "$DEPLOY_DIR/"
    cp -r app/components/CalendarTab.tsx "$DEPLOY_DIR/"
    cp calendar-schema.sql "$DEPLOY_DIR/"
    cp CALENDAR_INTEGRATION_README.md "$DEPLOY_DIR/"
    cp CALENDAR_TESTING_GUIDE.md "$DEPLOY_DIR/"
    cp test-calendar-api.js "$DEPLOY_DIR/"
    
    # Create deployment info
    cat > "$DEPLOY_DIR/DEPLOYMENT_INFO.txt" << EOF
Calendar Integration Deployment Package
Generated: $(date)

Files included:
- API endpoints: app/api/calendar/ and app/api/caldav/
- Admin component: CalendarTab.tsx
- Database schema: calendar-schema.sql
- Documentation: CALENDAR_INTEGRATION_README.md
- Testing guide: CALENDAR_TESTING_GUIDE.md
- Test script: test-calendar-api.js

Next steps:
1. Run calendar-schema.sql in your Supabase SQL editor
2. Deploy the API endpoints to your Next.js application
3. Update AdminDashboard.tsx to include CalendarTab
4. Test the integration using the testing guide
5. Create your first calendar token in the admin dashboard

For detailed instructions, see CALENDAR_INTEGRATION_README.md
EOF
    
    # Create archive
    tar -czf "calendar-integration-$(date +%Y%m%d-%H%M%S).tar.gz" "$DEPLOY_DIR"
    
    print_success "Deployment package created: calendar-integration-$(date +%Y%m%d-%H%M%S).tar.gz"
    print_status "Deployment directory: $DEPLOY_DIR"
}

# Function to validate deployment
validate_deployment() {
    print_status "Validating deployment..."
    
    # Check if API endpoints exist
    if [ ! -d "app/api/calendar" ]; then
        print_error "Calendar API endpoints not found"
        exit 1
    fi
    
    if [ ! -d "app/api/caldav" ]; then
        print_error "CalDAV API endpoints not found"
        exit 1
    fi
    
    # Check if component exists
    if [ ! -f "app/components/CalendarTab.tsx" ]; then
        print_error "CalendarTab component not found"
        exit 1
    fi
    
    print_success "Deployment validation passed"
}

# Function to show usage
show_usage() {
    echo "Calendar Integration Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --check-env      Check environment variables"
    echo "  --migrate-db     Run database migration"
    echo "  --install-deps   Install dependencies"
    echo "  --build          Build application"
    echo "  --test           Run tests"
    echo "  --package        Create deployment package"
    echo "  --validate       Validate deployment"
    echo "  --full           Run full deployment process"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --full                    # Run complete deployment"
    echo "  $0 --check-env --migrate-db  # Check env and run migration"
    echo "  $0 --package                 # Create deployment package only"
}

# Main deployment function
full_deployment() {
    print_status "Starting full deployment process..."
    
    check_env_vars
    run_database_migration
    install_dependencies
    build_application
    validate_deployment
    run_tests
    
    print_success "Full deployment completed successfully!"
    print_status "Next steps:"
    echo "1. Deploy your application to your hosting platform"
    echo "2. Test the calendar integration using the testing guide"
    echo "3. Create your first calendar token in the admin dashboard"
    echo "4. Share the calendar URL with users"
}

# Parse command line arguments
case "${1:-}" in
    --check-env)
        check_env_vars
        ;;
    --migrate-db)
        run_database_migration
        ;;
    --install-deps)
        install_dependencies
        ;;
    --build)
        build_application
        ;;
    --test)
        run_tests
        ;;
    --package)
        create_deployment_package
        ;;
    --validate)
        validate_deployment
        ;;
    --full)
        full_deployment
        ;;
    --help)
        show_usage
        ;;
    "")
        print_status "No options provided. Running full deployment..."
        full_deployment
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
