# MixBox - Docker Service Management Platform

## Overview

MixBox is a Docker service management platform designed for simplified container orchestration and deployment. The application provides a user-friendly interface for managing Docker services, with features including an application marketplace, service configuration, and automated deployment through YAML configurations. The platform is built as a full-stack web application with a React frontend and Express backend, targeting users who need an intuitive way to manage Docker containers without deep technical expertise.

**Key Characteristics:**
- Real Docker operations only (no mock mode)
- Multi-language support (Chinese Simplified, English, Traditional Chinese)
- Lightweight SQLite database with PostgreSQL migration path
- Self-contained deployment with intelligent proxy routing

## Development Environment

### Commands
- **Development server**: `npm run dev` - Starts both frontend and backend in development mode
- **Type checking**: `npm run check` - Runs TypeScript compiler checks across the codebase
- **Database operations**: `npm run db:push` - Applies database schema changes using Drizzle Kit
- **Production build**: `npm run build` - Builds frontend assets and compiles backend code
- **Production start**: `npm run start` - Runs the production server

### Environment Variables
- `NODE_ENV` - Set to 'development' or 'production'
- Database configuration will be file-based SQLite (no external dependencies)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with dedicated routes for services, applications, and settings
- **File Structure**: Modular approach with separate route handlers and storage abstractions
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Session Management**: Express sessions with SQLite storage for persistent login state

### Database Design
- **Database**: SQLite (default) with better-sqlite3 driver for optimal performance
- **ORM**: Drizzle ORM with SQLite dialect for type-safe database operations
- **Schema**: Well-defined tables for users, services, applications, settings, and session storage
- **Migration Strategy**: Drizzle Kit for schema migrations and database versioning
- **File Location**: `./data/mixbox.db` (auto-created)
- **Future Compatibility**: Easy migration to PostgreSQL via Drizzle adapter switching

### Authentication System
- **Primary Strategy**: Username/password authentication with passport-local
- **Session Storage**: SQLite-backed sessions with configurable TTL
- **Middleware**: Passport.js strategy for flexible authentication
- **Security**: bcrypt password hashing, HTTP-only cookies with secure flags
- **Future Integration**: passport-openidconnect for OIDC providers
- **TODO**: OTP implementation using passport-totp or speakeasy

### Docker Integration
- **Operations**: Real Docker API integration only (remove USE_MOCK logic)
- **Container Management**: Complete lifecycle operations (create, start, stop, delete)
- **Network Integration**: Uses internal Docker networking for service communication
- **Service Configuration**: YAML-based service definitions with metadata and spec sections

### Service Management
- **Configuration Format**: Standardized YAML-based service definitions
- **Service Lifecycle**: Create, update, start, stop, and delete operations for containerized services
- **Dynamic Proxy System**: Intelligent Layer 7 proxy that automatically routes subdomain requests
- **Zero-Configuration Routing**: Automatically detects service availability and routes traffic
- **Domain Management**: Automatic domain allocation using configurable default domain

### Application Marketplace Architecture
- **Centralized Catalog**: Uses `apps/catalog.yaml` as the single source of truth
- **On-Demand Loading**: Application YAML configurations loaded only when needed
- **Unified Data Manager**: AppDataManager interface for consistent API
- **Local Mode**: Loads catalog from local file system
- **Remote Mode**: Fetches catalog from GitHub API with 5-minute caching
- **Category System**: Structured categorization with metadata
- **Installation Status**: Real-time comparison with deployed services

## Multi-language Support

### Internationalization Framework
- **Library**: react-i18next (React ecosystem standard)
- **Supported Languages**: 
  - 简体中文 (zh-CN) - Default language
  - English (en)
  - 繁體中文 (zh-TW)
- **Language Detection Priority**: User Settings → Browser Preference → Default (zh-CN)

### Translation Structure
```
client/src/locales/
├── zh-CN/                 # 简体中文 (默认)
│   ├── common.json        # 通用文本
│   ├── auth.json          # 认证相关
│   ├── services.json      # 服务管理
│   ├── marketplace.json   # 应用市场
│   └── errors.json        # 错误信息
├── en/                    # English
│   ├── common.json
│   ├── auth.json
│   ├── services.json
│   ├── marketplace.json
│   └── errors.json
└── zh-TW/                 # 繁體中文
    ├── common.json
    ├── auth.json
    ├── services.json
    ├── marketplace.json
    └── errors.json
```

### Backend Internationalization
- **Express i18n**: Middleware for API error message localization
- **Database**: User language preference stored in user settings table
- **Features**: Namespace-based translations, pluralization, interpolation support

### Implementation Guidelines
- All user-facing text must use translation keys (no hardcoded strings)
- Component props should accept translation keys, not direct text
- Form validation errors should be translatable
- API error responses should include localized messages
- Consider CJK text rendering and layout differences

## File Structure

```
mixbox/
├── client/                           # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Shadcn/UI components
│   │   │   ├── layout/              # Layout components
│   │   │   ├── marketplace/         # Marketplace specific
│   │   │   └── services/            # Service management
│   │   ├── pages/                   # Route components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities and configurations
│   │   ├── locales/                 # Translation files
│   │   │   ├── zh-CN/              # 简体中文
│   │   │   ├── en/                 # English
│   │   │   └── zh-TW/              # 繁體中文
│   │   └── main.tsx                # Application entry point
│   └── index.html                   # HTML template
├── server/                          # Express backend services
│   ├── index.ts                    # Server entry point
│   ├── routes.ts                   # API route definitions
│   ├── docker-operations.ts       # Docker API integration
│   ├── proxy-server.ts            # Dynamic proxy system
│   ├── app-data-manager.ts        # Application data management
│   ├── storage.ts                  # Database operations
│   ├── db.ts                       # Database connection and schema
│   └── auth/                       # Authentication modules
├── shared/                          # Shared TypeScript types
│   └── schema.ts                   # Common type definitions
├── apps/                           # Application marketplace
│   ├── catalog.yaml               # Application catalog
│   └── *.yaml                     # Individual app configurations
├── data/                           # SQLite database files (auto-created)
│   └── mixbox.db                  # Main database file
└── dist/                          # Production build output
```

## Development Conventions

### Code Standards
- **TypeScript**: Strict mode enabled across all modules
- **Components**: Use Shadcn/UI component library for consistency
- **API Design**: Follow RESTful patterns with proper HTTP status codes
- **Database**: Type-safe operations using Drizzle ORM
- **Forms**: React Hook Form with Zod schema validation
- **Styling**: Tailwind CSS with semantic class names

### Internationalization Rules
- Never use hardcoded strings in components
- Use translation keys with descriptive namespaces
- Consider text length variations between languages
- Test UI with longer German/English text and shorter Chinese text
- Provide context comments for translators

### File Naming
- Components: PascalCase (e.g., `ServiceCard.tsx`)
- Hooks: camelCase starting with 'use' (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `queryClient.ts`)
- Translation files: kebab-case (e.g., `common.json`)

## Key Features

### Service Management
- **Docker Integration**: Complete container lifecycle management
- **YAML Configuration**: Declarative service definitions
- **Real-time Status**: Live container status monitoring
- **Network Management**: Automatic Docker network setup
- **Volume Handling**: Persistent data volume management

### Application Marketplace
- **Catalog System**: Centralized application discovery
- **One-click Install**: Automated service deployment
- **Update Management**: Version comparison and update notifications
- **Category Filtering**: Organized application browsing
- **GitHub Integration**: Remote catalog synchronization

### Dynamic Proxy System
- **Automatic Routing**: Subdomain-based service access
- **Zero Configuration**: Self-discovering service endpoints
- **Health Monitoring**: Automatic failover and recovery
- **SSL Support**: Ready for certificate integration
- **Performance Optimization**: Internal Docker network routing

### Session Management
- **SQLite Sessions**: Lightweight, file-based session storage
- **Configurable TTL**: Adjustable session timeout
- **Security Headers**: CSRF protection and secure cookies
- **Multi-device Support**: Concurrent session handling

## External Dependencies

### Core Libraries
- **React Ecosystem**: React 18, TypeScript, Vite build system
- **UI Framework**: Radix UI primitives with Shadcn/UI styling
- **State Management**: TanStack Query for server state synchronization
- **Database**: better-sqlite3 with Drizzle ORM abstraction
- **Authentication**: Passport.js with extensible strategy system

### Development Tools
- **Build System**: Vite with hot module replacement and TypeScript support
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Code Quality**: TypeScript compiler with strict mode enabled
- **CSS Framework**: Tailwind CSS with custom design system integration

### Future Considerations
- **Database Migration**: Easy PostgreSQL upgrade path via Drizzle adapters
- **OIDC Integration**: passport-openidconnect for enterprise authentication
- **OTP Support**: Two-factor authentication implementation
- **Monitoring**: Service health monitoring and alerting system
- **Backup**: Database backup and restore functionality

## Getting Started

1. **Clone and Install**: `npm install`
2. **Development**: `npm run dev` (starts both frontend and backend)
3. **Database**: Automatically created on first run at `./data/mixbox.db`
4. **Access**: Frontend at `http://localhost:5173`, Backend API at `http://localhost:3000`
5. **Docker**: Ensure Docker is installed and running for container management

The platform is designed to be self-contained with minimal external dependencies, making it easy to deploy and manage across different environments.