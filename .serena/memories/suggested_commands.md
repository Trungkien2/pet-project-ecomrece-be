# Updated Suggested Commands

## Development Commands

### Installation & Setup
```bash
# Clone repository
git clone https://github.com/Trungkien2/pet-project-ecomrece-be.git
cd pet-project-ecomrece-be

# Install dependencies
npm install

# Environment setup
copy .env.example .env
# Edit .env with your database and service configurations

# Database setup
npm run migration:run
```

### Development Server
```bash
# Start development server with hot reload
npm run start:dev

# Start in debug mode (with debugger)
npm run start:debug

# Build the project
npm run build

# Start production server
npm run start:prod
```

### Code Quality & Maintenance
```bash
# Format code with Prettier
npm run format

# Lint code with ESLint (auto-fix enabled)
npm run lint

# Run both formatting and linting (recommended before commits)
npm run format && npm run lint
```

### Testing Suite
```bash
# Run unit tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run end-to-end tests
npm run test:e2e

# Debug tests with Node inspector
npm run test:debug
```

### Database Operations
```bash
# Run pending migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert

# Generate new migration
npm run migration:generate -- --name migration_name

# View migration status
npm run migration:status
```

### API Documentation
```bash
# Start server and visit http://localhost:3000/api for Swagger docs
npm run start:dev
```

## Windows Specific Commands

### Process & Port Management
```powershell
# Check what's running on port 3000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <process_id> /F

# Alternative: Kill all Node processes
taskkill /IM node.exe /F
```

### File Operations
```powershell
# List directory contents
dir
Get-ChildItem  # PowerShell equivalent

# Navigate directories
cd path\to\directory

# Copy files
copy source destination
Copy-Item source destination  # PowerShell

# Find files
dir /s *.ts  # Find all TypeScript files recursively
Get-ChildItem -Recurse -Filter "*.ts"  # PowerShell
```

### Environment Variables
```powershell
# Set environment variable for current session
$env:NODE_ENV="development"

# View all environment variables
Get-ChildItem Env:
```

## Git Workflow Commands

### Daily Development
```bash
# Check status and current branch
git status
git branch

# Create feature branch
git checkout -b feature/feature-name

# Stage and commit changes
git add .
git commit -m "feat: descriptive commit message"

# Push to remote
git push origin feature/feature-name

# Pull latest changes
git pull origin main
```

### Branch Management
```bash
# Switch between branches
git checkout main
git checkout feature/feature-name

# Merge feature branch
git checkout main
git merge feature/feature-name

# Delete feature branch after merge
git branch -d feature/feature-name
git push origin --delete feature/feature-name
```

## Docker Commands (Future)
```bash
# Build Docker image
docker build -t ecommerce-backend .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Performance & Monitoring
```bash
# Monitor application logs
npm run start:dev | tee logs/app.log

# Check memory usage
# Use Task Manager or Resource Monitor on Windows

# Profile application
npm run start:debug
# Use Chrome DevTools for profiling
```

## Production Deployment
```bash
# Build for production
npm run build

# Run production build
npm run start:prod

# PM2 process management (if using PM2)
pm2 start dist/main.js --name "ecommerce-backend"
pm2 logs ecommerce-backend
pm2 restart ecommerce-backend
```

## Recommended Development Workflow
1. `npm run start:dev` - Start development server
2. Make code changes with hot reload
3. `npm run test` - Run tests for modified components
4. `npm run format` - Format code consistently
5. `npm run lint` - Check and fix code quality
6. Test API endpoints using Swagger at `http://localhost:3000/api`
7. Commit changes following conventional commit format
8. Push to feature branch and create PR

## Troubleshooting Commands
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rmdir /s node_modules  # Windows
npm install

# Reset TypeScript cache
npx tsc --build --clean

# Check Node and npm versions
node --version
npm --version
```