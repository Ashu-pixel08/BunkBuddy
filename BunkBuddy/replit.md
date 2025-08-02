# Overview

Bunk Planner is a comprehensive attendance tracking and academic planning web application designed for students. The application helps students monitor their class attendance, calculate attendance percentages, plan when they can skip classes ("bunk"), manage academic calendars, and collaborate with peers through group planning features. It provides a dashboard-driven experience with real-time calculations and notifications to help students maintain required attendance while optimizing their academic schedule.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based frontend with TypeScript, built using Vite for fast development and bundling. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable components. The styling system uses Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes.

The frontend follows a component-based architecture with:
- **Layout Components**: Sidebar navigation and topbar for consistent UI structure
- **Page Components**: Dedicated pages for dashboard, attendance calculator, calendar, groups, timetable, and alerts
- **Shared Components**: Reusable UI components and utilities
- **State Management**: React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
The backend is built with Express.js and TypeScript, following a RESTful API design. The server implements:
- **Route Registration**: Centralized route management in `server/routes.ts`
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **Middleware**: Request logging, error handling, and development tooling
- **Development Integration**: Vite middleware for hot module replacement in development

The API provides endpoints for:
- User management and authentication
- Subject and attendance tracking
- Group creation and membership
- Event and calendar management
- Notifications and alerts
- Timetable management
- File upload capabilities (using multer)

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes:
- **Users**: User profiles and authentication data
- **Subjects**: Course information with attendance tracking
- **Groups**: Collaborative planning groups with membership
- **Events**: Calendar events and deadlines
- **Notifications**: Alert system for attendance and events
- **Timetables**: Class schedules and timing
- **Bunk Plans**: Planned absences and group coordination

The storage layer is abstracted through an interface pattern, allowing for easy testing and potential database swapping.

## Authentication and Authorization
The application implements a session-based authentication system using:
- **Demo User System**: Currently uses a hardcoded demo user for development
- **Session Storage**: PostgreSQL session storage using connect-pg-simple
- **User Context**: Consistent user identification across all API endpoints

## Design Patterns and Utilities
The application employs several utility libraries and patterns:
- **Attendance Calculations**: Custom utilities for percentage calculations and status determination
- **Date Formatting**: Comprehensive date utilities using date-fns for relative time and formatting
- **Theme Management**: Context-based theme provider with localStorage persistence
- **Form Handling**: React Hook Form integration with Zod validation
- **Responsive Design**: Mobile-first responsive design with custom mobile hooks

## Development and Build Tools
The development environment includes:
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Build Process**: Vite for frontend bundling and esbuild for backend compilation
- **Development Server**: Integrated development experience with HMR and error overlays
- **Database Management**: Drizzle Kit for schema migrations and database management

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Session Storage**: PostgreSQL-based session storage for authentication

## UI and Styling Libraries
- **Radix UI**: Comprehensive component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for image/content sliders

## Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for type-safe data handling
- **date-fns**: Date manipulation and formatting utilities

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **Replit Integration**: Development environment integration and deployment tools

## File Upload and Processing
- **Multer**: Middleware for handling multipart/form-data file uploads
- **CSV Processing**: Planned integration for timetable and data import functionality

## Utility Libraries
- **clsx**: Conditional className utility
- **class-variance-authority**: Component variant management
- **nanoid**: Unique ID generation for entities