# Overview

MixBox is a Docker service management platform designed for simplified container orchestration and deployment. The application provides a user-friendly interface for managing Docker services, with features including an application marketplace, service configuration, and automated deployment through YAML configurations. The platform is built as a full-stack web application with a React frontend and Express backend, targeting users who need an intuitive way to manage Docker containers without deep technical expertise.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

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
- **Configuration Format**: YAML-based service definitions with metadata and specifications
- **Docker Integration**: Docker Compose generation from YAML configurations
- **Service Lifecycle**: Create, update, start, stop, and delete operations for containerized services
- **Domain Management**: Automatic subdomain assignment with Traefik integration for reverse proxy

## Application Marketplace
- **Source**: GitHub repository integration for fetching application templates
- **Discovery**: Category-based filtering and search functionality
- **Installation**: One-click deployment from marketplace applications to running services
- **Customization**: User-configurable parameters during installation process

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