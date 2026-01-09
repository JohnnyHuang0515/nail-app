# Nail Salon API

Backend API for the Nail Salon Management & Booking System.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Language**: TypeScript

## Setup

### Prerequisites

- Node.js 20+ installed
- PostgreSQL running on `localhost:5432`
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and configure DATABASE_URL and JWT secrets

# Run database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

### Development

```bash
# Start development server with hot-reload
npm run dev
```

Server will run on `http://localhost:3000`

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Documentation

### Authentication

#### Register Manager/Admin
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "manager@example.com",
  "password": "password123",
  "name": "Manager Name",
  "role": "MANAGER"
}
```

#### Login (Email/Password)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "manager@example.com",
  "password": "password123"
}
```

#### LINE Login (LIFF)
```
POST /api/auth/line-login
Content-Type: application/json

{
  "idToken": "LINE_ID_TOKEN_HERE"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Upcoming Endpoints

- `/api/services` - Service management
- `/api/staff` - Staff/stylist management
- `/api/bookings` - Booking management
- `/api/clients` - Client management
- `/api/inventory` - Inventory management
- `/api/coupons` - Coupon management
- `/api/reports` - Analytics and reports

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

Main models:
- `User` - Users (customers, staff, managers)
- `Staff` - Stylist/staff information
- `Service` - Available services
- `Booking` - Customer bookings
- `BookingItem` - Individual services in a booking
- `Coupon` - Discount coupons
- `InventoryItem` - Inventory items
- `InventoryTransaction` - Inventory movements
- `ClientVisit` - Visit history

## Project Structure

```
nail-salon-api/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── src/
│   ├── lib/
│   │   └── prisma.ts        # Prisma client instance
│   ├── middleware/
│   │   └── auth.ts          # Authentication middleware
│   ├── routes/
│   │   └── auth.routes.ts   # Auth endpoints
│   ├── schemas/
│   │   └── auth.schema.ts   # Validation schemas
│   ├── utils/
│   │   ├── jwt.ts           # JWT utilities
│   │   └── password.ts      # Password hashing
│   └── server.ts            # Express app entry point
├── .env                     # Environment variables
├── tsconfig.json            # TypeScript config
└── package.json
```

## Environment Variables

```env
DATABASE_URL="postgresql://postgres@localhost:5432/nail_salon"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
LINE_CHANNEL_ID=""
LINE_CHANNEL_SECRET=""
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

## Next Steps

1. ✅ Database schema created
2. ✅ Authentication system implemented
3. 🔄 Implement service endpoints
4. 🔄 Implement staff endpoints
5. 🔄 Implement booking endpoints
6. 🔄 Implement client management
7. 🔄 Integrate LINE Login verification
8. 🔄 Add API documentation (Swagger)
9. 🔄 Deploy to production

## License

ISC
