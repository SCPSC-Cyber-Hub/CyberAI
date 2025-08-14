# Cyber AI Chat Application

## Overview

This is a full-stack AI chat application built with React, Express.js, and Google's Gemini AI. The application features a modern, cyber-themed UI with real-time chat capabilities, allowing users to have conversations with an AI assistant that maintains conversation history and context.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom cyber-themed color palette
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with centralized route registration
- **Data Storage**: In-memory storage implementation with interface-based design for easy database migration
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Three main tables - users, conversations, and messages
- **Migration**: Drizzle Kit for schema management and migrations
- **Connection**: Neon Database serverless PostgreSQL

### AI Integration
- **Provider**: Google Gemini AI (gemini-2.5-flash model)
- **Features**: 
  - Contextual conversations with history
  - Automatic conversation title generation
  - Custom system instructions for cyber AI personality
  - Error handling and fallback responses

### Development Tools
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Quality**: ESLint and Prettier (implied by project structure)
- **Development Experience**: Hot module replacement and runtime error overlay

## External Dependencies

### Core Runtime Dependencies
- **@google/genai**: Google Gemini AI client for chat functionality
- **@neondatabase/serverless**: PostgreSQL database connection for Neon
- **drizzle-orm** & **drizzle-zod**: Database ORM and schema validation
- **express**: Web server framework
- **react** & **react-dom**: Frontend framework

### UI and Styling
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management
- **zod**: Runtime type validation and schema definition

### Development Dependencies
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development plugins
- **wouter**: Lightweight routing library

### Environment Requirements
- **DATABASE_URL**: PostgreSQL connection string (Neon Database)
- **GEMINI_API_KEY** or **GOOGLE_API_KEY**: Google Gemini AI API key
- **NODE_ENV**: Environment configuration (development/production)