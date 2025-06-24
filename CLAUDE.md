# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

**ChatAdmisión** is a React-based document chatbot application with RAG (Retrieval-Augmented Generation) capabilities for admission inquiries. The application integrates with a Flask backend for real RAG functionality.

### Key Technologies
- **React 18** + **TypeScript** + **Vite**
- **shadcn/ui** component library (40+ components in `src/components/ui/`)
- **Tailwind CSS** for styling
- **TanStack React Query** for state management
- **PDF.js** for PDF text extraction
- **React Router DOM** for routing

### Application Structure

```
src/
├── pages/           # Route components
│   ├── Index.tsx    # Landing page (/)
│   ├── Chat.tsx     # Chat interface (/chat)  
│   ├── Admin.tsx    # PDF management (/admin)
│   └── NotFound.tsx # 404 page
├── components/      # React components
│   ├── ui/          # shadcn/ui components (reusable)
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   ├── PDFUploader.tsx
│   └── PDFList.tsx
├── services/
│   └── PDFService.ts # PDF processing logic
├── hooks/           # Custom React hooks
└── lib/             # Utility functions
```

### Data Flow Architecture

1. **PDF Upload**: Admin page → PDFUploader component → Backend API (/api/upload/pdf) → Server processing & vector DB
2. **Chat Flow**: Chat page → ChatInterface → Backend API (/api/chat) → Real RAG responses with sources
3. **Backend Integration**: Flask API at http://localhost:5001/api with full RAG capabilities

### Component Patterns

- Uses shadcn/ui components extensively - check `src/components/ui/` for available components
- Form validation with React Hook Form + Zod
- Toast notifications via Sonner
- Responsive design with mobile-first approach

### Backend Integration

- **Real RAG System**: Full integration with Flask backend using Google Gemini LLM
- **PDF Processing**: Server-side text extraction and vector database storage
- **Conversation Management**: Persistent conversations with message history
- **Source Attribution**: Responses include document source URLs for transparency

### Development Notes

- Frontend connects to Flask backend at http://localhost:5001/api
- Backend uses ChromaDB for vector storage and Google Gemini for LLM
- API client in `src/services/apiClient.ts` handles all backend communication
- Environment variables configured in `.env.local` (VITE_API_BASE_URL)
- UI follows shadcn/ui design system patterns
- TypeScript strict mode enabled
- ESLint configured for React best practices

### Backend Setup

The backend is located at `/Users/danielmilstein/Desktop/UANDES/IAA/rag-admision`. To run the full system:

1. **Start Backend**:
   ```bash
   cd /Users/danielmilstein/Desktop/UANDES/IAA/rag-admision
   pip install -r requirements.txt
   # Set up .env with Google AI API keys
   python run.py
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

### API Endpoints Used

- `GET /api/health` - Backend health check
- `POST /api/chat` - Chat with RAG system  
- `POST /api/upload/pdf` - Upload PDF documents
- `GET /api/conversations` - Get conversation history
- `DELETE /api/conversations/{id}` - Delete conversations