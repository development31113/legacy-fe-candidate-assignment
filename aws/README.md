# AWS Serverless API

AWS Lambda serverless API для Web3 Message Signer с использованием DynamoDB.

## 🚀 Быстрый старт

### Предварительные требования

1. **AWS CLI** установлен и настроен
2. **Node.js 18+** и **npm**
3. **Serverless Framework** глобально установлен:
   ```bash
   npm install -g serverless
   ```

### Установка

1. Перейдите в папку AWS:
   ```bash
   cd aws
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Скопируйте файл окружения:
   ```bash
   cp env.example .env
   ```

4. Настройте переменные окружения в `.env`:
   ```env
   DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
   AWS_REGION=us-east-1
   STAGE=dev
   ```

### Локальная разработка

Запустите API локально:
```bash
npm run dev
```

API будет доступен на `http://localhost:3001`

### Развёртывание

#### Развёртывание в dev окружении:
```bash
npm run deploy
```

#### Развёртывание в production:
```bash
npm run deploy:prod
```

#### Удаление развёртывания:
```bash
npm run remove
```

## 📋 API Endpoints

После развёртывания API будет доступен по адресу:
`https://[api-id].execute-api.[region].amazonaws.com/[stage]/`

### Endpoints:

- `POST /verify-signature` - Верификация подписи
- `GET /messages?walletAddress=...` - Получение сообщений
- `POST /messages` - Сохранение сообщения
- `DELETE /messages?walletAddress=...` - Удаление сообщений
- `GET /health` - Проверка здоровья API

## 🗄️ DynamoDB

Автоматически создаётся таблица DynamoDB с именем:
`web3-message-signer-api-messages-[stage]`

### Схема таблицы:
- **Partition Key**: `walletAddress` (String)
- **Sort Key**: `messageId` (String)
- **TTL**: 30 дней

## 🔧 Конфигурация

### Переменные окружения:

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DYNAMIC_ENVIRONMENT_ID` | ID окружения Dynamic.xyz | - |
| `AWS_REGION` | AWS регион | us-east-1 |
| `STAGE` | Стадия развёртывания | dev |
| `DYNAMODB_TABLE` | Имя таблицы DynamoDB | auto-generated |

### Настройка CORS

CORS настроен для всех origins (`*`). Для production рекомендуется ограничить origins.

## 📊 Мониторинг

### CloudWatch Logs

Логи доступны в CloudWatch:
```bash
npm run logs -- -f verifySignature
npm run logs -- -f getMessages
```

### Метрики

Автоматически собираются метрики:
- Количество запросов
- Время выполнения
- Ошибки
- Использование памяти

## 🔒 Безопасность

- IAM роли настроены с минимальными правами
- DynamoDB таблица с TTL для автоматической очистки
- Валидация входных данных
- CORS защита

## 💰 Стоимость

- **Lambda**: ~$0.20 за 1M запросов
- **DynamoDB**: ~$1.25 за 1M операций чтения/записи
- **API Gateway**: ~$3.50 за 1M запросов

## 🚀 CI/CD

### GitHub Actions

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

## 🔧 Устранение неполадок

### Ошибки развёртывания

1. Проверьте AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```

2. Проверьте права доступа к DynamoDB

3. Проверьте логи:
   ```bash
   npm run logs
   ```

### Локальные проблемы

1. Очистите кэш:
   ```bash
   npm run clean
   ```

2. Переустановите зависимости:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📚 Дополнительные ресурсы

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/) 