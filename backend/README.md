# ELEVATE Backend

Backend API for the ELEVATE learning platform built with Node.js, Express, TypeScript, and Prisma.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

3. **Database setup:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push schema to database
   npm run prisma:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/otp/send` - Send OTP to email
- `POST /api/auth/otp/verify` - Verify OTP and login

### User Profile
- `GET /api/me` - Get user profile
- `PUT /api/me` - Update user profile
- `GET /api/me/stats` - Get user statistics

### Missions (Students only)
- `GET /api/missions` - List user missions
- `POST /api/missions` - Create new mission
- `GET /api/missions/:id` - Get mission by ID
- `PUT /api/missions/:id` - Update mission
- `DELETE /api/missions/:id` - Delete mission

### Projects (Students only)
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Reflections (Students only)
- `GET /api/reflections` - List user reflections
- `POST /api/reflections` - Create new reflection
- `GET /api/reflections/:id` - Get reflection by ID
- `PUT /api/reflections/:id` - Update reflection
- `DELETE /api/reflections/:id` - Delete reflection

### Collaboration Circles
- `GET /api/collaborations` - List circles
- `POST /api/collaborations/:id/join` - Join circle
- `POST /api/collaborations/:id/leave` - Leave circle

## Documentation

API documentation is available at `/docs` when the server is running.

## User Roles

- **Students** (`@alustudent.com`): Can manage missions, projects, and reflections
- **Mentors** (`@alu.edu`): Can view student progress and provide feedback
- **Admins** (specific `@alu.edu` emails): Full system access

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key models:
- User (authentication and profile)
- Mission (learning goals)
- Project (mission-linked projects)
- Reflection (learning journals)
- Circle (collaboration groups)

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio for database management