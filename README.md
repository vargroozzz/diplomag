# Beekeepers Community Platform

A full-stack web application designed to connect beekeepers worldwide, facilitating knowledge exchange, community building, and event organization.

## Features

- 🔐 Secure authentication with JWT
- 💬 Discussion boards and forums
- 📨 Private messaging system
- 📚 Knowledge base with verified content
- 📅 Event organization and management
- 🔔 Real-time notifications
- 👥 User profiles and experience sharing
- 🛡️ Admin panel for content moderation

## Tech Stack

- **Frontend**: React + TypeScript with Material-UI
- **Backend**: NestJS + TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: WebSocket for chat and notifications
- **Authentication**: JWT
- **Containerization**: Docker

## Project Structure

```
beekeepers-community/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
│
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── entities/      # Database models
│   │   ├── dto/          # Data transfer objects
│   │   └── guards/       # Authentication guards
│   └── test/             # Backend tests
│
└── docker/                # Docker configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Docker (optional)

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Update the variables as needed

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run start:dev

   # Start frontend server
   cd ../client
   npm start
   ```

### Docker Deployment

1. Build and start containers:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Documentation: http://localhost:4000/api

## API Documentation

The API documentation is available at `/api` when running the backend server. It's automatically generated using Swagger and includes:

- Authentication endpoints
- User management
- Forum operations
- Messaging system
- Event management
- Knowledge base operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 