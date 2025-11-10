# Hydra Backend API

## Setup

1. Install dependencies:
```bash
cd backend
uv sync
```

2. Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Supabase credentials (already configured with defaults)

4. Run the server:
```bash
uv run uvicorn main:app --reload
```

Or if you prefer to use the virtual environment directly:
```bash
source .venv/bin/activate  # On macOS/Linux
uvicorn main:app --reload
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new user account
  - Body: `{ "email": "user@example.com", "password": "password123", "full_name": "John Doe" }`
  - Returns: Access token and user info

- `POST /api/auth/signin` - Sign in existing user
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Returns: Access token and user info

- `GET /api/auth/me` - Get current user (requires Bearer token)
  - Headers: `Authorization: Bearer <token>`
  - Returns: User profile

- `POST /api/auth/signout` - Sign out current user (requires Bearer token)
  - Headers: `Authorization: Bearer <token>`

## Database Schema

The database includes:
- `profiles` table - Extends Supabase auth.users with additional profile information
- Row Level Security (RLS) policies for secure data access
- Automatic profile creation on user signup via trigger

