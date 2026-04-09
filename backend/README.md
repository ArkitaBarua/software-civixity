# Civixity Backend

This is the backend server for the Civixity chatbot, integrating Supabase database with Gemini AI.

## Features

- 🤖 AI-powered chatbot using Google Gemini
- 📊 Real-time data from Supabase posts table
- 🔐 User authentication integration
- 📍 Location-based post queries
- 🏷️ Category-based post filtering
- 📈 Post analytics and summaries

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Fill in your environment variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Get API Keys

#### Supabase Keys
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon key
4. For the service role key, use the `service_role` key (keep this secret!)

#### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 4. Run the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000`

## API Endpoints

### Chatbot
- `POST /api/chatbot/chat` - Send a message to the AI chatbot
- `GET /api/chatbot/posts/location/:location` - Get posts by location
- `GET /api/chatbot/posts/category/:category` - Get posts by category
- `GET /api/chatbot/posts/summary` - Get recent posts summary

### Health Check
- `GET /api/health` - Server health status

## Database Schema

The backend expects these tables in your Supabase database:

### posts table
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  location TEXT,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### chat_interactions table (optional)
```sql
CREATE TABLE chat_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Frontend Integration

The frontend chatbot component is already configured to connect to this backend. Make sure:

1. The backend is running on port 4000
2. CORS is properly configured for your frontend URL
3. All environment variables are set correctly

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check your `.env` file has all required Supabase keys

2. **"Missing Gemini API key"**
   - Verify your Gemini API key is correct and active

3. **CORS errors**
   - Ensure `FRONTEND_URL` in `.env` matches your frontend URL

4. **Database connection errors**
   - Check your Supabase URL and service role key
   - Verify the posts table exists in your database

### Logs

The server provides detailed logging for debugging:
- Chat requests and responses
- Database query errors
- AI generation errors
- API endpoint access

## Security

- Rate limiting is enabled (100 requests per 15 minutes per IP)
- Helmet.js provides security headers
- CORS is configured for your frontend domain only
- Environment variables keep sensitive keys secure 