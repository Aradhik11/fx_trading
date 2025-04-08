# FX Trading App Backend

A NestJS-based backend for an FX Trading application that allows users to register, verify their email, fund their wallet, and trade currencies including Naira (NGN).

## Key Features

- User authentication with email verification
- Multi-currency wallet management
- Real-time FX rates integration
- Currency conversion and trading
- Transaction history

## Tech Stack

- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API Documentation**: Swagger

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/Aradhik11/fx_trading.git
cd fx-trading-app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_DATABASE=fx_trading

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d

# Email
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_password

# FX API
FX_API_URL=https://www.exchangerate-api.com/v4/latest
FX_API_KEY=your_api_key

# App
APP_URL=http://localhost:3000
PORT=3000
```

4. Start the application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

5. Access the API at `http://localhost:3000`

## API Documentation

After starting the application, visit `http://localhost:3000/api-docs` to access the Swagger documentation.

### Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register a new user |
| `/auth/verify` | POST | Verify email address |
| `/auth/login` | POST | Login and get access token |
| `/wallet` | GET | Get user wallet balances |
| `/wallet/fund` | POST | Fund wallet |
| `/wallet/convert` | POST | Convert between currencies |
| `/wallet/trade` | POST | Trade currencies |
| `/fx/rates` | GET | Get current FX rates |
| `/transactions` | GET | Get transaction history |

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Auth Module**: Handles user authentication and verification
- **Wallet Module**: Manages user wallets and balances
- **FX Module**: Integrates with external FX rate APIs
- **Transaction Module**: Records and manages transaction history
- **Shared Module**: Contains utility services like email sending

## Database Schema

![Database Schema](https://placeholder-database-schema.com)

### Key Entities

- **Users**: User accounts with email verification status
- **Wallets**: Multi-currency wallets for each user
- **Transactions**: Records of all financial activities

## Testing

```bash
# Run all tests
npm run test

# Run test coverage
npm run test:cov
```

## Architectural Decisions

1. **Transaction Atomicity**: I use database transactions to ensure that currency exchanges are atomic and prevent race conditions.

2. **Multi-Currency Design**: Each user can have multiple wallets, one per currency, allowing for scalable currency support.

3. **Rate Caching**: FX rates are cached for a configurable period to reduce API calls and improve performance.

4. **Error Handling**: External API failures are handled gracefully with fallback mechanisms.

## Scalability Considerations

- **Horizontal Scaling**: The application can be deployed across multiple instances behind a load balancer.
- **Rate Limiting**: API endpoints include rate limiting to prevent abuse.
- **Caching**: Multiple layers of caching reduce database and external API load.
- **Database Indices**: Strategic indexing on frequently queried fields.