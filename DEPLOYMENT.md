 # Deployment Guide - Vercel Serverless

## 🚀 Quick Deploy to Vercel

This project is now configured for serverless deployment on Vercel with database support.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Dynamic.xyz Account**: Get your environment ID from [app.dynamic.xyz](https://app.dynamic.xyz/)

### Step 1: Deploy to Vercel

1. **Import Project**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Configure Environment Variables**:
   ```
   NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
   ```

3. **Deploy**: Click "Deploy"

### Step 2: Setup Vercel KV Database

1. **Add KV Database**:
   - Go to your Vercel project dashboard
   - Navigate to "Storage" tab
   - Click "Create Database"
   - Select "KV" (Redis)
   - Choose a plan (Hobby plan is free)

2. **Environment Variables** (auto-configured):
   ```
   KV_URL=...
   KV_REST_API_URL=...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   ```

### Step 3: Configure Domain (Optional)

1. **Custom Domain**:
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Update `NEXT_PUBLIC_VERCEL_URL` in environment variables

## 🔧 Local Development

### Prerequisites

```bash
# Install dependencies
cd frontend
npm install

# Copy environment variables
cp env.example .env.local
```

### Environment Variables (.env.local)

```env
# Dynamic.xyz Configuration
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# Backend URL (for local development)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Vercel URL (leave empty for local)
NEXT_PUBLIC_VERCEL_URL=
```

### Run Development Server

```bash
npm run dev
```

## 📊 Database Architecture

### Vercel KV (Redis)

- **Storage**: Message history per wallet address
- **Key Format**: `messages:{walletAddress}`
- **Value**: Array of MessageData objects
- **Limit**: 50 messages per wallet

### Fallback Strategy

1. **Production**: Vercel KV database
2. **Local Development**: localStorage
3. **Error Handling**: Automatic fallback to localStorage

## 🔄 Data Flow

### Message Signing Process

1. **User signs message** → Wallet generates signature
2. **Frontend** → Calls `/api/verify-signature`
3. **Verification** → Serverless function validates signature
4. **Storage** → Message saved to KV database
5. **UI Update** → MessageHistory refreshes

### Data Persistence

- **Cross-device**: Messages stored in Vercel KV
- **Offline**: Fallback to localStorage
- **Privacy**: Each wallet sees only their messages

## 🛠️ API Endpoints

### `/api/verify-signature`
- **Method**: POST
- **Purpose**: Verify Ethereum message signatures
- **Input**: `{ message, signature }`
- **Output**: `{ isValid, signer, originalMessage, timestamp }`

### `/api/messages`
- **GET**: Retrieve messages for wallet
- **POST**: Save new message
- **DELETE**: Clear messages for wallet

### `/api/health`
- **Method**: GET
- **Purpose**: Database connectivity check

## 🔒 Security Features

- **Wallet-specific data**: Each wallet sees only their messages
- **Signature verification**: Cryptographic validation
- **Input sanitization**: All inputs validated
- **Error handling**: Graceful fallbacks

## 📈 Performance

- **Serverless**: Auto-scaling functions
- **Edge caching**: Global CDN
- **Database**: Redis for fast access
- **Optimization**: Only 50 messages per wallet

## 🚨 Troubleshooting

### Common Issues

1. **KV Connection Failed**:
   - Check environment variables
   - Verify KV database is created
   - Check Vercel project settings

2. **Dynamic.xyz Not Working**:
   - Verify environment ID
   - Check domain whitelist
   - Test in development first

3. **Build Errors**:
   - Check TypeScript errors
   - Verify all dependencies installed
   - Check environment variables

### Debug Mode

Enable detailed logging by checking browser console for:
- API request/response logs
- Database operation logs
- Error details

## 🔄 Migration from Backend

The project now uses serverless functions instead of a separate backend:

- ✅ **No backend server needed**
- ✅ **Automatic scaling**
- ✅ **Global deployment**
- ✅ **Database included**
- ✅ **Simplified deployment**

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` | Dynamic.xyz environment ID | Yes |
| `KV_URL` | Vercel KV connection URL | Auto |
| `KV_REST_API_URL` | KV REST API URL | Auto |
| `KV_REST_API_TOKEN` | KV API token | Auto |
| `NEXT_PUBLIC_VERCEL_URL` | Vercel deployment URL | Auto |

## 🎯 Next Steps

1. **Deploy to Vercel**
2. **Setup KV database**
3. **Configure environment variables**
4. **Test functionality**
5. **Monitor performance**

Your Web3 Message Signer is now ready for production! 🚀