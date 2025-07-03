# 🚀 Quick Start Guide

Get the Web3 Message Signer & Verifier running in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

## 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd WEB3-TEST

# Install all dependencies (frontend + backend)
npm run install:all
```

## 2. Environment Setup

### Frontend (.env.local)
```bash
cd frontend
cp env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Backend (.env)
```bash
cd ../backend
cp env.example .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 3. Get Dynamic.xyz Environment ID

1. Go to [Dynamic Dashboard](https://app.dynamic.xyz/)
2. Create a new project or use existing
3. Copy your Environment ID
4. Add it to `frontend/.env.local`

## 4. Start the Application

### Option A: Start Both Services
```bash
# From root directory
npm run dev
```

### Option B: Start Separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 6. Test the Application

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Sign in with Dynamic.xyz
4. Enter a message and sign it
5. View the verification result

## 7. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

## 8. Development Commands

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Start production build
npm start
```

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Dynamic.xyz Issues
- Ensure your Environment ID is correct
- Check Dynamic.xyz dashboard for any errors
- Verify your project is properly configured

### Backend Connection Issues
- Check if backend is running on port 3001
- Verify CORS settings in backend/.env
- Check browser console for errors

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Docker Deployment

```bash
# Build and run with Docker
docker-compose up --build

# Run in background
docker-compose up -d
```

## Production Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy

### Backend (Render/Railway)
1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables
4. Deploy

## Support

- Check the main README.md for detailed documentation
- Review test files for usage examples
- Check browser console and server logs for errors 