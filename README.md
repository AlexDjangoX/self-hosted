# 🤖 Bilingual Education Platform - Frontend

> Self-hosted AI services for English-Polish education with Chat, Translation, Text-to-Speech, and Image Generation

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## Features

### 🔐 **Authentication System**
- JWT-based authentication with refresh tokens
- User registration and login
- Role-based access control (user/admin)
- Persistent sessions with localStorage
- Demo account: `admin@example.com` / `admin123`

### 💬 **AI Chat**
- Powered by **Ollama** (llama3.2:3b)
- Multi-turn conversations with context
- Real-time streaming responses
- Customizable model selection

### 🌍 **Translation Service**
- English ↔ Polish translation
- Powered by **LibreTranslate** (self-hosted)
- Auto-language detection
- Quick example phrases
- Copy to clipboard functionality
- Language swap with one click

### 🔊 **Text-to-Speech**
- Professional multilingual TTS using **XTTS v2**
- **58 high-quality voices** available
- Support for English and Polish
- Automatic text chunking for long content (up to 50KB)
- Speed control (0.5x - 2.0x)
- Downloadable WAV audio files
- ⚠️ CPU processing: 30-60s per 240 characters

### 🎨 **Image Generation**
- AI image generation using **Stable Diffusion**
- Multiple sizes: 256x256, 512x512, 1024x1024
- Quality settings: Standard / HD
- Download generated images

## Prerequisites

**Backend API must be running at `http://localhost:3000`**

The backend provides all AI services:
- **Ollama** - Chat completions
- **XTTS** - Text-to-speech with 58 voices
- **LibreTranslate** - Translation engine
- **Stable Diffusion** - Image generation

👉 See `../llm-services/README.md` for backend setup

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 3. Login or Register

- **Demo Account**: `admin@example.com` / `admin123`
- **Or** create a new account via the registration form

## Project Structure

```
self-hosted/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application page
│   │   ├── layout.tsx        # Root layout with AuthProvider
│   │   └── globals.css       # Global styles (Tailwind)
│   ├── components/
│   │   ├── ChatInterface.tsx      # AI Chat UI
│   │   ├── Translation.tsx        # Translation UI
│   │   ├── TextToSpeech.tsx       # TTS UI with voice selector
│   │   ├── ImageGenerator.tsx     # Image generation UI
│   │   ├── UserMenu.tsx           # User profile dropdown
│   │   ├── AuthModal.tsx          # Authentication modal
│   │   └── AccountModal.tsx       # Account settings
│   └── contexts/
│       └── AuthContext.tsx        # Authentication state management
├── public/                   # Static assets
├── package.json             # Dependencies
└── README.md               # This file
```

## API Endpoints

The frontend connects to these backend endpoints:

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `DELETE /api/auth/delete-account` - Delete account

### AI Services
- `POST /api/chat` - Chat completions
- `POST /api/translate` - Text translation
- `POST /api/tts` - Generate speech audio
- `GET /api/tts/voices` - List available TTS voices (58 voices)
- `POST /api/images` - Generate images

## Environment Configuration

The frontend is pre-configured to connect to the backend at:
- **Backend URL**: `http://localhost:3000`
- **Frontend URL**: `http://localhost:3001`

These are hardcoded in the components. To change:
1. Update all `fetch('http://localhost:3000/api/...')` calls
2. Or create a `.env.local` file (see below)

### Optional: `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Then update fetch calls to use:
```typescript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tts`, ...)
```

## Development

### Available Scripts

```bash
# Start development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16.1.4** | React framework with App Router |
| **React 19.2.3** | UI library |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Context API** | State management (Auth) |

## Features Deep Dive

### Text-to-Speech Component

The TTS component features:
- **58 professional voices** loaded from XTTS backend
- **Automatic chunking**: Texts > 240 chars are split at sentence boundaries
- **Seamless audio**: Chunks are concatenated on the backend
- **Progress indication**: Shows estimated processing time
- **Max length**: 50,000 characters (~4-5 minutes of audio)

**Performance** (CPU-based XTTS):
- Short text (<100 chars): ~30-60 seconds
- Medium text (100-300 chars): ~1-2 minutes  
- Long text (300+ chars): ~2-5 minutes

**Recommendation**: Keep text under 200 characters for optimal user experience.

### Translation Component

Features:
- **Bidirectional**: English ↔ Polish
- **Auto-detect**: Automatically detects source language
- **Language swap**: One-click language reversal
- **Quick examples**: Pre-filled example phrases
- **Character counter**: Real-time length tracking
- **Copy button**: Instant clipboard copy

### Chat Component

Features:
- **Context-aware**: Maintains conversation history
- **Model selection**: Choose Ollama model
- **Clear chat**: Reset conversation
- **Streaming**: Real-time response generation
- **Error handling**: Graceful failure recovery

### Image Generator

Features:
- **Size options**: 256x256, 512x512, 1024x1024
- **Quality settings**: Standard / HD
- **Download**: Save generated images
- **Preview**: View generated images inline
- **Error handling**: Clear error messages

## Authentication Flow

1. **Register** → Creates user account in backend
2. **Login** → Receives JWT access + refresh tokens
3. **Store tokens** → Saved in localStorage
4. **Auto-refresh** → Refreshes expired access tokens
5. **Attach headers** → All API requests include `Authorization: Bearer <token>`

### Token Management

- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Auto-refresh**: Handled transparently by AuthContext
- **Logout**: Clears tokens from localStorage

## Troubleshooting

### Backend Connection Issues

**Error**: `Failed to fetch` or `Network error`

**Solutions**:
1. Ensure backend is running at `http://localhost:3000`
2. Check CORS is properly configured in backend
3. Verify backend health: `curl http://localhost:3000/health`

```bash
# Start backend (from llm-services directory)
cd ../llm-services
docker-compose up -d
```

### TTS Not Working

**Error**: `Failed to generate speech`

**Solutions**:
1. Check XTTS container is running: `docker ps | grep xtts`
2. Wait for XTTS model to load (~30-60 seconds on first start)
3. Check XTTS logs: `docker logs xtts`
4. Try shorter text (<200 chars) to avoid timeout

**Performance Warning**: XTTS on CPU is SLOW. Long texts take minutes to process.

### Translation Not Working

**Error**: `Translation failed`

**Solutions**:
1. Check LibreTranslate container: `docker ps | grep libretranslate`
2. Verify backend logs: `docker logs llm-services`
3. Ensure source/target languages are supported

### Authentication Issues

**Error**: `Invalid or expired token`

**Solutions**:
1. Click "Logout" and login again
2. Clear localStorage: `localStorage.clear()`
3. Check backend auth service is running

## Production Deployment

### Build the Application

```bash
npm run build
npm start
```

### Environment Variables

For production, set:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### CORS Configuration

Ensure backend allows your frontend domain:

```bash
# In backend .env
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Security Considerations

1. **HTTPS**: Use HTTPS in production for both frontend and backend
2. **JWT Secrets**: Use strong, random JWT secrets in backend
3. **CORS**: Restrict ALLOWED_ORIGINS to your frontend domain only
4. **Rate Limiting**: Backend has rate limiting enabled (100 req/15min)
5. **Password Requirements**: Minimum 6 characters enforced

## Known Issues

1. **TTS Slow on CPU**: XTTS processing is 30-60s per 240 chars on CPU. Consider GPU for production.
2. **Browser Timeout**: Long TTS requests may timeout in browser. Keep text < 200 chars.
3. **Image Generation**: Requires Stable Diffusion backend running (not included in minimal setup).

## Contributing

1. Follow existing code style (TypeScript + Tailwind)
2. Test all components before committing
3. Update README for new features
4. Ensure CORS and authentication work correctly

## Related Projects

- **Backend API**: `../llm-services/` - Express.js backend with AI services
- **Ollama**: Chat completions
- **XTTS**: Text-to-speech engine
- **LibreTranslate**: Translation service
- **Stable Diffusion**: Image generation

## License

Private - Internal use only

## Support

For issues:
1. Check backend logs: `docker logs llm-services`
2. Check service health: `curl http://localhost:3000/health`
3. Verify all Docker containers are running: `docker ps`
4. See `../llm-services/README.md` for backend troubleshooting

---

**Built with Next.js 16 (Turbopack) for fast development and optimal performance** 🚀
