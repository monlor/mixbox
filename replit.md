# Overview

MixBox is a Docker service management platform designed for simplified container orchestration and deployment. The application provides a user-friendly interface for managing Docker services, with features including an application marketplace, service configuration, and automated deployment through YAML configurations. The platform is built as a full-stack web application with a React frontend and Express backend, targeting users who need an intuitive way to manage Docker containers without deep technical expertise.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Docker Operations Architecture
- **Environment-Based Switching**: USE_MOCK environment variable controls mock vs real Docker operations (default: mock mode)
- **Unified Interface**: DockerOperations interface provides consistent API for both mock and real implementations
- **Mock Operations**: Full Docker service simulation with realistic delays and status management for development
- **Real Operations**: Complete Docker API integration with container management, network setup, and volume handling
- **Service Management**: Comprehensive CRUD operations for Docker containers with mixbox network integration

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with dedicated routes for services, applications, and settings
- **File Structure**: Modular approach with separate route handlers and storage abstractions
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Session Management**: Express sessions with PostgreSQL storage for persistent login state

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema**: Well-defined tables for users, services, applications, settings, and session storage
- **Migration Strategy**: Drizzle Kit for schema migrations and database versioning
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Authentication System
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Middleware**: Passport.js strategy for OIDC authentication flow
- **Security**: HTTP-only cookies with secure flags and CSRF protection

## Service Management
- **Configuration Format**: Standardized YAML-based service definitions with metadata, spec, and services sections
- **Docker Integration**: Complete Docker Compose generation from YAML configurations with mock service simulation
- **Service Lifecycle**: Create, update, start, stop, and delete operations for containerized services
- **Domain Management**: Automatic subdomain assignment with Traefik integration for reverse proxy
- **Mock Operations**: Full Docker service simulation with realistic delays and status management for development

## Application Marketplace Architecture
- **Unified Data Manager**: AppDataManager interface provides consistent API for both local and remote data sources
- **Local Mode** (USE_MOCK=true): Direct file system reading from `/apps` directory for development
- **Remote Mode** (USE_MOCK=false): GitHub API integration for fetching applications from remote repository
- **Caching System**: 5-minute cache for remote data to reduce API calls and improve performance
- **Discovery**: Category-based filtering and search functionality with real application metadata
- **Installation**: One-click deployment from marketplace applications to running Docker services
- **Configuration**: Complete YAML-based application definitions with environment variable customization

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL database hosting with automatic scaling
- **Replit Authentication**: OIDC provider for user authentication and session management
- **GitHub API**: Repository content fetching for marketplace application discovery

## Frontend Libraries
- **Radix UI**: Accessible component primitives for dialog, dropdown, form, and navigation components
- **TanStack Query**: Server state synchronization and caching layer
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration
- **Wouter**: Minimalist routing library for single-page application navigation

## Backend Dependencies
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support
- **Passport.js**: Authentication middleware with OpenID Connect strategy
- **Express Session**: Session management with PostgreSQL store integration
- **JS-YAML**: YAML parsing and generation for service configuration files

## Development Tools
- **Vite**: Fast build tool with hot module replacement and TypeScript support
- **ESBuild**: JavaScript bundler for production builds
- **TypeScript**: Static type checking across frontend and backend codebases
- **Zod**: Runtime type validation for API requests and form data