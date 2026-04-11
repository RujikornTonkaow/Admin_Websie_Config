# Portfolio Admin Panel

Admin panel (CMS) for managing the Portfolio website content. Built with Nuxt 3, Vue 3 Composition API, TypeScript, and TailwindCSS.

## Architecture Overview

This project is part of a 3-project system:

| Project | Port | Description |
|---------|------|-------------|
| **Portfolio** (Frontend) | 3000 | Public-facing portfolio website |
| **Admin_Website_Management** (Backend) | 8080 | Go REST API + MongoDB |
| **Website_Config** (This project) | 3001 | Admin panel for managing content |

## Features

- **Login** — JWT-based authentication
- **Dashboard** — Overview with stats and quick actions
- **Site Settings** — Site title, SEO metadata, default theme, profile image
- **Hero Section** — Greeting text, name, subtitle, CTA buttons
- **About Section** — Bio paragraphs, personality tags, stats
- **Skills** — CRUD management with icon picker
- **Projects** — CRUD management with image upload and reordering
- **Experience** — CRUD management with reordering (timeline)
- **Social Links** — CRUD management with icon preview
- **Messages** — View and manage contact form submissions

## Prerequisites

- Node.js 18+
- Backend API running on port 8080 (`Admin_Website_Management`)
- MongoDB running (used by backend)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server (port 3001)
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

## Default Login Credentials

Set via backend environment variables:

- Username: `admin`
- Password: `changeme123`

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Nuxt 3 | 3.15+ | Meta-framework (SPA mode) |
| Vue 3 | 3.5+ | UI framework (Composition API) |
| TypeScript | 5.8+ | Type safety |
| TailwindCSS | 3.x | Utility-first styling |
| @nuxt/icon | 1.12+ | Iconify icon system |

## Project Structure

```
Website_Config/
├── app.vue                    # Root app component
├── nuxt.config.ts             # Nuxt configuration
├── tailwind.config.ts         # Tailwind configuration
├── assets/css/
│   └── tailwind.css           # Global styles + component classes
├── composables/
│   ├── useAuth.ts             # Authentication (JWT token management)
│   └── useAdminApi.ts         # API client for all admin endpoints
├── components/
│   ├── AdminSidebar.vue       # Sidebar navigation
│   ├── AdminHeader.vue        # Top header bar
│   ├── FormImageUpload.vue    # Image upload component
│   ├── FormTagInput.vue       # Tag input component
│   ├── ConfirmDialog.vue      # Confirmation modal
│   └── Toast.vue              # Toast notification
├── layouts/
│   ├── default.vue            # Admin layout (sidebar + header)
│   └── auth.vue               # Auth layout (login page)
├── middleware/
│   └── auth.global.ts         # Route guard (redirect to login)
├── pages/
│   ├── login.vue              # Login page
│   ├── index.vue              # Dashboard
│   ├── site-settings.vue      # Site settings form
│   ├── hero.vue               # Hero section form
│   ├── about.vue              # About section form
│   ├── skills.vue             # Skills CRUD
│   ├── projects.vue           # Projects CRUD + reorder
│   ├── experiences.vue        # Experience CRUD + reorder
│   ├── social-links.vue       # Social links CRUD
│   └── contacts.vue           # Contact messages viewer
└── types/
    └── admin.ts               # TypeScript interfaces
```
