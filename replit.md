# Soundboard Pro - Application Documentation

## Overview

This is a modern web-based soundboard application built with a full-stack TypeScript architecture. The application allows users to upload, manage, and play audio files with customizable settings, hotkey support, and a responsive interface. It features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React SPA with TypeScript, styled using Tailwind CSS and shadcn/ui components
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **UI Framework**: Radix UI primitives with custom styling via Tailwind CSS

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI
- **Audio Processing**: Web Audio API for sound playback and effects

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle with PostgreSQL dialect
- **File Handling**: Multer for audio file uploads
- **Session Management**: express-session with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Database Schema
The application uses two main tables:
- **sounds**: Stores audio file metadata including name, filename, duration, volume, color, and keybind
- **settings**: Global application settings for hotkeys, audio levels, and playback preferences

### Audio System
- **Playback**: Web Audio API for high-quality audio playback
- **Effects**: Volume control, speed modification, and overlap management
- **Hotkeys**: Global keyboard shortcuts for sound triggering and control
- **Output Routing**: Support for multiple audio outputs (primary, secondary, mic injection)

## Data Flow

1. **Audio Upload**: Files are uploaded via multipart form data, validated for audio format, and stored on the server
2. **Sound Management**: CRUD operations for sounds with real-time updates via TanStack Query
3. **Audio Playback**: Sounds are loaded into Web Audio API buffers and played with customizable settings
4. **Settings Persistence**: User preferences are stored in PostgreSQL and synchronized across sessions
5. **Real-time Updates**: Client state is automatically synchronized with server data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **multer**: File upload handling middleware
- **connect-pg-simple**: PostgreSQL session store

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional CSS class names
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migration and introspection tools

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR and React Fast Refresh
- **Backend**: tsx for TypeScript execution with hot reload
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite build process creates optimized static assets
- **Backend**: esbuild bundles server code into a single Node.js executable
- **Database**: PostgreSQL with connection pooling via Neon serverless

### Configuration
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **File Storage**: Local filesystem for uploaded audio files
- **Session Management**: PostgreSQL-backed sessions for user state

The application is designed to be deployed on platforms like Replit, with support for both development and production environments through environment-specific configurations.