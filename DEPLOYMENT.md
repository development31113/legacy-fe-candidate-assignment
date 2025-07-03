# 🚀 Deployment Guide

Этот проект поддерживает развёртывание как на **Vercel**, так и на **AWS** с serverless архитектурой.

## 📋 Содержание

- [Vercel Deployment](#vercel-deployment)
- [AWS Serverless Deployment](#aws-serverless-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Monitoring](#monitoring)

## 🌐 Vercel Deployment

### Предварительные требования

1. **Vercel Account** - [vercel.com](https://vercel.com)
2. **Vercel CLI** (опционально):
   ```bash
   npm i -g vercel
   ```

### Развёртывание

1. **Подключите репозиторий к Vercel:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите ваш GitHub репозиторий
   - Настройте переменные окружения (см. ниже)

2. **Настройте переменные окружения в Vercel Dashboard:**
   ```env
   # Dynamic.xyz
   NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
   
   # API Configuration
   NEXT_PUBLIC_API_PROVIDER=vercel
   NEXT_PUBLIC_VERCEL_API_URL=https://your-app.vercel.app
   
   # Vercel KV (автоматически настроится)
   KV_URL=
   KV_REST_API_URL=
   KV_REST_API_TOKEN=
   KV_REST_API_READ_ONLY_TOKEN=
   ```

3. **Подключите Vercel KV:**
   - В Vercel Dashboard → Storage → KV
   - Создайте новую базу данных
   - Vercel автоматически добавит переменные окружения

4. **Развёртывание:**
   ```bash
   # Автоматическое развёртывание при push в main
   git push origin main
   
   # Или локальное развёртывание
   vercel --prod
   ```

### Vercel Features

- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Serverless Functions**
- ✅ **Vercel KV (Redis)**
- ✅ **Edge Functions**
- ✅ **Automatic Deployments**

## ☁️ AWS Serverless Deployment

### Предварительные требования

1. **AWS Account** с настроенными credentials
2. **AWS CLI** установлен и настроен:
   ```bash
   aws configure
   ```
3. **Serverless Framework**:
   ```bash
   npm install -g serverless
   ```

### Развёртывание Backend

1. **Перейдите в папку AWS:**
   ```bash
   cd aws
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения:**
   ```bash
   cp env.example .env
   ```
   
   Отредактируйте `.env`:
   ```env
   DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
   AWS_REGION=us-east-1
   STAGE=dev
   ```

4. **Развёртывание:**
   ```bash
   # Development
   npm run deploy
   
   # Production
   npm run deploy:prod
   ```

5. **Получите API Gateway URL:**
   ```bash
   serverless info
   ```

### Развёртывание Frontend

1. **Настройте переменные окружения для AWS:**
   ```env
   NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
   NEXT_PUBLIC_API_PROVIDER=aws
   NEXT_PUBLIC_AWS_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev
   ```

2. **Развёртывание на Vercel:**
   - Используйте тот же процесс, что и выше
   - Измените только `NEXT_PUBLIC_API_PROVIDER=aws`

3. **Или развёртывание на AWS S3 + CloudFront:**
   ```bash
   # Build
   npm run build
   
   # Deploy to S3
   aws s3 sync out/ s3://your-bucket-name
   
   # Invalidate CloudFront
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

### AWS Services Used

- ✅ **AWS Lambda** - Serverless functions
- ✅ **API Gateway** - REST API
- ✅ **DynamoDB** - NoSQL database
- ✅ **CloudWatch** - Monitoring & logs
- ✅ **IAM** - Security & permissions
- ✅ **S3 + CloudFront** - Static hosting (опционально)

## 🔧 Environment Variables

### Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` | Dynamic.xyz Environment ID | ✅ | - |
| `NEXT_PUBLIC_API_PROVIDER` | API Provider: 'vercel' or 'aws' | ❌ | 'vercel' |
| `NEXT_PUBLIC_VERCEL_API_URL` | Vercel API URL | ❌ | '/api' |
| `NEXT_PUBLIC_AWS_API_URL` | AWS API Gateway URL | ❌ | - |

### Backend Variables (Vercel)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DYNAMIC_ENVIRONMENT_ID` | Dynamic.xyz Environment ID | ✅ | - |
| `KV_URL` | Vercel KV URL | ✅ | Auto |
| `KV_REST_API_URL` | Vercel KV REST API URL | ✅ | Auto |
| `KV_REST_API_TOKEN` | Vercel KV Token | ✅ | Auto |

### Backend Variables (AWS)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DYNAMIC_ENVIRONMENT_ID` | Dynamic.xyz Environment ID | ✅ | - |
| `AWS_REGION` | AWS Region | ❌ | 'us-east-1' |
| `STAGE` | Deployment stage | ❌ | 'dev' |
| `DYNAMODB_TABLE` | DynamoDB table name | ❌ | Auto |

## 🗄️ Database Setup

### Vercel KV (Redis)

Автоматически настраивается при подключении в Vercel Dashboard.

### AWS DynamoDB

Автоматически создаётся при развёртывании serverless функций.

**Схема таблицы:**
```json
{
  "TableName": "web3-message-signer-api-messages-dev",
  "KeySchema": [
    {
      "AttributeName": "walletAddress",
      "KeyType": "HASH"
    },
    {
      "AttributeName": "messageId", 
      "KeyType": "RANGE"
    }
  ],
  "TTL": {
    "AttributeName": "ttl",
    "Enabled": true
  }
}
```

## 📊 Monitoring

### Vercel

- **Analytics**: Vercel Dashboard → Analytics
- **Functions**: Vercel Dashboard → Functions
- **Logs**: Vercel Dashboard → Functions → View Function Logs

### AWS

- **CloudWatch Logs**:
  ```bash
  # View logs
  npm run logs -- -f verifySignature
  npm run logs -- -f getMessages
  
  # Tail logs
  npm run logs -- -f verifySignature --tail
  ```

- **CloudWatch Metrics**:
  - Lambda invocations
  - API Gateway requests
  - DynamoDB operations
  - Error rates

## 🔒 Security

### Vercel

- ✅ **Automatic HTTPS**
- ✅ **Environment variables encryption**
- ✅ **Function isolation**
- ✅ **Rate limiting**

### AWS

- ✅ **IAM roles with least privilege**
- ✅ **API Gateway authentication** (опционально)
- ✅ **DynamoDB encryption at rest**
- ✅ **CloudTrail audit logs**

## 💰 Cost Estimation

### Vercel (Hobby Plan - Free)

- **Frontend**: Free
- **Serverless Functions**: 100GB-hours/month free
- **Vercel KV**: 100MB free
- **Bandwidth**: 100GB/month free

### AWS (Pay-per-use)

**Пример для 10,000 запросов/месяц:**
- **Lambda**: ~$0.002 (10K invocations)
- **API Gateway**: ~$0.035 (10K requests)
- **DynamoDB**: ~$0.0125 (10K operations)
- **CloudWatch**: ~$0.50 (logs)
- **Total**: ~$0.55/month

## 🚀 CI/CD

### GitHub Actions для AWS

Создайте `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd aws && npm install
      - run: cd aws && npm run deploy:prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          DYNAMIC_ENVIRONMENT_ID: ${{ secrets.DYNAMIC_ENVIRONMENT_ID }}
```

### Vercel

Автоматическое развёртывание при push в main branch.

## 🔧 Troubleshooting

### Vercel Issues

1. **Functions timeout**:
   - Увеличьте timeout в `vercel.json`
   - Оптимизируйте код

2. **KV connection errors**:
   - Проверьте переменные окружения
   - Убедитесь, что KV подключена

### AWS Issues

1. **Lambda cold starts**:
   - Используйте provisioned concurrency
   - Оптимизируйте bundle size

2. **DynamoDB throttling**:
   - Увеличьте read/write capacity
   - Используйте on-demand billing

3. **API Gateway CORS**:
   - Проверьте CORS настройки в serverless.yml
   - Добавьте custom domain

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [AWS Serverless Documentation](https://docs.aws.amazon.com/serverless/)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [Dynamic.xyz Documentation](https://docs.dynamic.xyz/)