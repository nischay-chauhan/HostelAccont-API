# Hostel Account API

A robust REST API built with Node.js, Express, and TypeScript for managing hostel accounts and related operations.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Cookie Parser
- BCrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HostelAccont-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the `.env` file with your configuration:
     - Set your PostgreSQL database URL
     - Configure JWT secret and expiration
     - Set cookie secret
     - Configure port number

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Available Scripts

- `npm run build` - Builds the TypeScript code
- `npm start` - Runs the built application
- `npm run dev` - Runs the application in development mode with hot-reload

## Environment Variables

Make sure to set up the following environment variables in your `.env` file:

- `DATABASE_URL`: Your PostgreSQL database URL
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Application environment
- `COOKIE_SECRET`: Secret for cookie signing

## Project Structure

```
├── src/                  # Source code
├── prisma/              # Prisma schema and migrations
├── dist/                # Compiled JavaScript code
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── .env                 # Environment variables
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
