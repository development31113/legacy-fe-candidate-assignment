# Web3 Message Signer & Verifier

A full-stack Web3 application that allows users to authenticate with Dynamic.xyz embedded wallet, sign custom messages, and verify signatures on the backend.

## 🚀 Features

- **Dynamic.xyz Authentication**: Headless embedded wallet implementation
- **Message Signing**: Sign custom messages with your wallet
- **Signature Verification**: Backend verification using ethers.js
- **Message History**: Local storage for signed message history
- **Modern UI**: Beautiful, responsive design with great UX
- **TypeScript**: Full type safety across frontend and backend
- **Testing**: Comprehensive test suite with Jest
- **Security**: Rate limiting, input validation, and error handling

## 📁 Project Structure

```
WEB3-TEST/
├── frontend/                 # Next.js 14+ frontend application
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   │   ├── ui/        # Reusable UI components
│   │   │   └── ...        # Feature components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and wallet services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── __tests__/         # Test files
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/                # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── __tests__/     # Test files
│   └── package.json       # Backend dependencies
└── README.md              # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Dynamic.xyz account - [Sign up here](https://app.dynamic.xyz/)

### Quick Start

1. **Clone and install all dependencies:**
   ```bash
   git clone [git@github.com:development31113/Web3-Message-Signer.git](https://github.com/development31113/Web3-Message-Signer) 
   cd WEB3-TEST
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   # Frontend
   cd frontend
   cp env.example .env.local
   # Edit .env.local with your Dynamic.xyz environment ID
   
   # Backend
   cd ../backend
   cp env.example .env
   ```

3. **Start both frontend and backend:**
   ```bash
   # From root directory
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env.local
   ```

4. **Configure Dynamic.xyz:**
   - Get your Dynamic.xyz environment ID from [Dynamic Dashboard](https://app.dynamic.xyz/)
   - Add your environment ID to `.env.local`:
     ```
     NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id-here
     NEXT_PUBLIC_API_URL=http://localhost:3001/api
     ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

7. **Build for production:**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

6. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 🎯 Usage

1. **Authentication**: Click "Connect Wallet" to authenticate with Dynamic.xyz
2. **Message Input**: Enter a custom message you want to sign
3. **Sign Message**: Click "Sign Message" to sign with your wallet
4. **Verification**: The backend will verify your signature and return the result
5. **History**: View your signed message history in the app

## 🔧 API Endpoints

### POST /api/verify-signature

Verifies a message signature and returns the signer address.

**Request Body:**
```json
{
  "message": "Hello, Web3!",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "isValid": true,
  "signer": "0x1234...",
  "originalMessage": "Hello, Web3!"
}
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Running All Tests
```bash
# From root directory
cd frontend && npm test && cd ../backend && npm test
```

## 🚀 Deployment

### Frontend (Vercel)
1. Push your repo to GitHub.
2. Go to [vercel.com](https://vercel.com/) and import your repo.
3. Set environment variables from `frontend/env.example` in Vercel dashboard.
4. Deploy!

### Backend (Render)
1. Push your repo to GitHub.
2. Go to [render.com](https://render.com/) and create a new Web Service.
3. Select your repo and set root to `backend`.
4. Set environment variables from `backend/env.example` in Render dashboard.
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Deploy!

**Note:** Update `NEXT_PUBLIC_API_URL` in frontend env to point to your deployed backend URL.

## 🔒 Security Considerations

- All signature verification happens on the backend
- No private keys are ever exposed to the frontend
- Environment variables are used for sensitive configuration
- CORS is properly configured for production

## 🎨 Design Decisions

- **Component Architecture**: Modular, reusable components with clear separation of concerns
- **State Management**: React hooks for local state, context for global wallet state
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Responsive Design**: Mobile-first approach with modern CSS
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔮 Future Improvements

- [ ] Multi-factor authentication with Dynamic.xyz
- [ ] Support for multiple blockchain networks
- [ ] Message templates and categories
- [ ] Real-time signature verification status
- [ ] Export signed message history
- [ ] Advanced signature validation options
- [ ] WebSocket support for real-time updates
- [ ] Database integration for persistent storage
- [ ] User authentication and authorization
- [ ] API rate limiting per user

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Render/Railway)
1. Push code to GitHub
2. Create new Web Service
3. Connect repository
4. Set environment variables
5. Deploy

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Dynamic.xyz](https://dynamic.xyz/) for the embedded wallet solution
- [Ethers.js](https://ethers.org/) for Ethereum utilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🔒 Multi-Factor Authentication (MFA)

This app supports headless MFA via Dynamic.xyz. MFA is enabled by default in the DynamicProvider settings.

- When enabled, users will be prompted for a second authentication factor (e.g., email code) during wallet login.
- The UI will display "MFA enabled" if MFA is active for the session.
- You can manage MFA settings in your Dynamic.xyz dashboard.

For more details, see [Dynamic.xyz Headless MFA docs](https://docs.dynamic.xyz/headless/headless-mfa). 
