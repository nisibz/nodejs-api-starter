# Node.js API Starter

A production-ready Node.js API template with TypeScript, Prisma, JWT authentication, and Docker support.

## Features

- 🛠 TypeScript ecosystem
- 🔐 JWT-based authentication
- 🐳 Docker & Docker Compose setup
- 📊 PostgreSQL with Prisma ORM
- ✅ Validation middleware
- 📑 Pagination utilities
- 🚦 Error handling middleware
- 🧪 Jest integration tests
- 🔄 Environment-based configuration

## Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL 15+
- Docker (optional)

### Installation

1. Clone repository:

   ```bash
   git clone https://github.com/nisibz/nodejs-api-starter.git
   cd nodejs-api-starter
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment:

   ```bash
   cp .env.example .env
   ```

4. Database setup:

   ```bash
   npx prisma migrate dev
   node prisma/seed.mjs
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

## Environment Variables

| Variable             | Description               | Required | Default |
| -------------------- | ------------------------- | -------- | ------- |
| PORT                 | Application port          | Yes      | 3000    |
| NODE_ENV             | Environment mode          | Yes      |         |
| DATABASE_URL         | PostgreSQL connection URL | Yes      |         |
| ACCESS_TOKEN_SECRET  | JWT signing secret        | Yes      |         |
| ACCESS_TOKEN_EXPIRES | Token expiration time     | No       | 7D      |
| ALLOWED_ORIGINS      | CORS allowed origins      | Yes      |         |

## API Endpoints

### Authentication

- `POST /auth/login` - User login with email/password
- `POST /auth/register` - Create new user account

### Users

- `GET /users` - Paginated users list
- `GET /users/:id` - Get user details

## Database Seeding

The application includes a seed script with 5 test users:

```bash
npx prisma db seed
```

### Test Users Credentials

| Email               | Password  |
| ------------------- | --------- |
| <user1@example.com> | password1 |
| <user2@example.com> | password2 |
| <user3@example.com> | password3 |
| <user4@example.com> | password4 |
| <user5@example.com> | password5 |

Passwords are securely hashed using bcrypt (10 rounds) before storage.

## Security Features

- Password hashing with bcrypt
- JWT access tokens with expiration
- Environment-specific configuration
- CORS origin restrictions
- Input validation middleware

## Testing

Run integration tests with Jest:

```bash
npm run test
```

Test configuration:

- Uses `.env.test` environment file
- Automatic database cleanup between tests
- Test factory patterns for user creation

## Docker Deployment

### Development

```bash
docker-compose up --build
```

### Production

```bash
docker build -f Dockerfile.prod -t your-app:prod .
docker run -p 3000:3000 --env-file .env your-app:prod
```
