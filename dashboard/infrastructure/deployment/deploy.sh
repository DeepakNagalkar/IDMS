#!/bin/bash
# Document Analytics System Deployment Script

set -e

echo "🚀 Starting Document Analytics System Deployment..."

# Configuration
COMPOSE_FILE="infrastructure/docker-compose.yml"
ENV_FILE="infrastructure/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Create environment file if not exists
create_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_status "Creating environment file..."
        cat > "$ENV_FILE" << EOF
# OpenText DMS Configuration
OPENTEXT_USERNAME=admin
OPENTEXT_PASSWORD=admin123
OPENTEXT_API_KEY=your-opentext-api-key

# OCR Service Configuration
OCR_API_KEY=your-ocr-space-api-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Database Configuration
POSTGRES_PASSWORD=postgres_password
DATABASE_URL=postgresql://postgres:postgres_password@postgres:5432/document_analytics

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info
SCHEDULE_ENABLED=true

# Monitoring
GRAFANA_ADMIN_PASSWORD=admin123
EOF
        print_success "Environment file created at $ENV_FILE"
        print_warning "Please update the API keys in $ENV_FILE before deployment"
    else
        print_status "Environment file exists"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p infrastructure/logs
    mkdir -p infrastructure/temp
    mkdir -p infrastructure/mock-services/opentext
    mkdir -p infrastructure/monitoring/grafana/dashboards
    mkdir -p infrastructure/monitoring/grafana/datasources
    
    print_success "Directories created"
}

# Create mock OpenText service
create_mock_opentext() {
    print_status "Creating mock OpenText DMS service..."
    
    cat > infrastructure/mock-services/opentext/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Mock OpenText DMS</title>
</head>
<body>
    <h1>Mock OpenText DMS Service</h1>
    <p>This is a mock service for demonstration purposes.</p>
    <p>Status: Running</p>
</body>
</html>
EOF
    
    print_success "Mock OpenText service created"
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop any existing containers
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans
    
    # Build and start services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up --build -d
    
    print_success "Services started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    while ! docker exec document-analytics-db pg_isready -U postgres > /dev/null 2>&1; do
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    while ! docker exec document-analytics-redis redis-cli ping > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Redis is ready"
    
    # Wait for Dashboard
    print_status "Waiting for Dashboard..."
    sleep 10
    print_success "Dashboard should be ready"
}

# Display deployment information
show_deployment_info() {
    echo ""
    echo "🎉 Document Analytics System Deployment Complete!"
    echo ""
    echo "📊 Access Points:"
    echo "   Dashboard:     http://localhost:3000"
    echo "   API Service:   http://localhost:3001"
    echo "   Grafana:       http://localhost:3001 (admin/admin123)"
    echo "   Prometheus:    http://localhost:9090"
    echo "   OpenText Mock: http://localhost:8080"
    echo ""
    echo "🗄️  Database:"
    echo "   PostgreSQL:    localhost:5432 (postgres/postgres_password)"
    echo "   Redis:         localhost:6379"
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs:     docker-compose -f $COMPOSE_FILE logs -f"
    echo "   Stop system:   docker-compose -f $COMPOSE_FILE down"
    echo "   Restart:       docker-compose -f $COMPOSE_FILE restart"
    echo ""
    echo "🔧 Configuration:"
    echo "   Environment:   $ENV_FILE"
    echo "   Compose:       $COMPOSE_FILE"
    echo ""
}

# Health check
perform_health_check() {
    print_status "Performing health checks..."
    
    # Check dashboard
    if curl -s http://localhost:3000/health > /dev/null; then
        print_success "Dashboard health check passed"
    else
        print_warning "Dashboard health check failed"
    fi
    
    # Check API service
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "API service health check passed"
    else
        print_warning "API service health check failed"
    fi
    
    # Check database connection
    if docker exec document-analytics-db pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database health check passed"
    else
        print_warning "Database health check failed"
    fi
}

# Cleanup function
cleanup() {
    if [ "$1" = "full" ]; then
        print_status "Performing full cleanup..."
        docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
        docker system prune -f
        print_success "Full cleanup completed"
    else
        print_status "Stopping services..."
        docker-compose -f "$COMPOSE_FILE" down
        print_success "Services stopped"
    fi
}

# Main deployment function
main() {
    case "$1" in
        "deploy")
            check_prerequisites
            create_env_file
            create_directories
            create_mock_opentext
            deploy_services
            wait_for_services
            perform_health_check
            show_deployment_info
            ;;
        "stop")
            cleanup
            ;;
        "clean")
            cleanup "full"
            ;;
        "status")
            docker-compose -f "$COMPOSE_FILE" ps
            ;;
        "logs")
            docker-compose -f "$COMPOSE_FILE" logs -f
            ;;
        "restart")
            docker-compose -f "$COMPOSE_FILE" restart
            ;;
        *)
            echo "Usage: $0 {deploy|stop|clean|status|logs|restart}"
            echo ""
            echo "Commands:"
            echo "  deploy  - Deploy the complete system"
            echo "  stop    - Stop all services"
            echo "  clean   - Stop services and remove volumes"
            echo "  status  - Show service status"
            echo "  logs    - Show service logs"
            echo "  restart - Restart all services"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"