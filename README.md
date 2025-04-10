# FX Trading Application

A currency trading application built with NestJS that allows users to manage wallets, perform currency conversions, and track transactions.

## Features

- User Authentication (JWT)
- Wallet Management
- Currency Exchange
- Transaction History
- Swagger API Documentation

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd fx-trading-app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=fx_trading_app

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1d

# Email (if using email verification)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email
MAIL_PASSWORD=your_password
MAIL_FROM=noreply@example.com
```

4. Start the application
```bash
npm run start:dev
```

## API Documentation

The API documentation is available through Swagger UI at `http://localhost:3000/api`.

### Authentication

1. Register a new user:
   - POST `/api/auth/register`
   - Verify your email using the code sent to your email address

2. Login:
   - POST `/api/auth/login`
   - Save the returned JWT token

3. Using the API:
   - Click the "Authorize" button in Swagger UI
   - Enter your token with format: `Bearer your_token_here`
   - All authenticated endpoints will now work

### Available Endpoints

- **Auth**
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/login` - Login
  - POST `/api/auth/verify` - Verify email

- **Wallets**
  - GET `/api/wallets` - Get user wallets
  - POST `/api/wallets/fund` - Fund wallet
  - POST `/api/wallets/convert` - Convert currency
  - POST `/api/wallets/trade` - Trade currency

- **Transactions**
  - GET `/api/transactions` - Get transaction history
    - Optional query parameters:
      - `limit` (default: 50)
      - `offset` (default: 0)

### Transaction Types

The system supports the following transaction types:
- `DEPOSIT` - Adding funds to wallet
- `WITHDRAWAL` - Removing funds from wallet
- `TRANSFER` - Transferring between wallets
- `EXCHANGE` - Currency exchange

## Development

### Database Synchronization

The application uses TypeORM with `synchronize: true` for development, which automatically updates the database schema to match the entities.

### API Testing

You can test the API using:
- Swagger UI at `http://localhost:3000/api`
- Postman or similar API testing tools

## Security Notes

- JWT tokens expire after 24 hours
- Email verification is required for new accounts
- All amounts are stored with 8 decimal precision

## Error Handling

Common error responses:
- 401 Unauthorized - Invalid or missing JWT token
- 400 Bad Request - Invalid input data
- 404 Not Found - Resource not found
- 409 Conflict - Resource already exists