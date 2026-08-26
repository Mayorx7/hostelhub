<br><br><div align="center">
  <img src="src/assets/logo.jpg" alt="HostelHub Logo" width="80" height="80" />
  <h1>HostelHub</h1>
  <p><strong>A full-stack university hostel management system for administrators and students</strong></p>

  ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?logo=supabase&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)
</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Building for Production](#building-for-production)
- [Database Setup](#database-setup)
- [Supabase Edge Functions](#supabase-edge-functions)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)
- [Usage](#usage)
- [Important Notes](#important-notes)
- [License](#license)

---

## About

HostelHub is a comprehensive hostel management web application designed for university environments. It provides two distinct portals — one for **administrators** (hostel managers, staff) and one for **students** — covering the full lifecycle of hostel accommodation: room browsing, applications, bookings, payments, maintenance requests, and announcements.

---

## Features

### 🎓 Student Portal
- Browse available hostel blocks and rooms by gender
- View room details (type, capacity, price, availability)
- Submit hostel accommodation applications
- Track application and booking status
- View assigned room details
- Make and track accommodation fee payments via **Paystack**
- Submit maintenance/repair requests
- Receive hostel announcements and notifications

### 🛠️ Admin Dashboard
- Overview dashboard with key metrics and charts
- Manage hostel rooms (create, update, availability)
- View and manage student guest records
- Review and manage all bookings
- Track and manage payments
- Handle maintenance requests (assign, update status)
- Generate and view reports
- Post and manage announcements
- Role-based access control (admin vs. student)

### 🔐 Authentication & Security
- Email/password authentication via Supabase Auth
- Role-based route protection (admin / student)
- Row Level Security (RLS) on all database tables
- Sensitive credentials managed via environment variables and Supabase secrets

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS v3 + PostCSS |
| **Routing** | React Router DOM v6 |
| **Data Fetching / Caching** | TanStack React Query v5 |
| **Backend / Database** | Supabase (PostgreSQL + Auth + RLS) |
| **Edge Functions** | Supabase Edge Functions (Deno) |
| **Payment Gateway** | Paystack |
| **Charts** | Chart.js |
| **Icons** | Lucide React |
| **Linting** | ESLint 9 + TypeScript ESLint |
| **Deployment** | Vercel |

---

## Project Structure

```
hostelhub/
├── public/                        # Static assets
├── src/
│   ├── assets/                    # Images (room photos, logo, hero images)
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives (Button, Card, etc.)
│   │   ├── Header.tsx             # Public site header
│   │   ├── Navbar.tsx             # Public navigation bar
│   │   ├── Footer.tsx             # Site footer
│   │   ├── Layout.tsx             # Admin dashboard layout wrapper
│   │   ├── StudentLayout.tsx      # Student dashboard layout wrapper
│   │   ├── Sidebar.tsx            # Admin sidebar navigation
│   │   ├── StudentSidebar.tsx     # Student sidebar navigation
│   │   ├── ProtectedRoute.tsx     # Auth guard (role-based)
│   │   └── NotificationsPopover.tsx
│   ├── context/
│   │   └── AuthContext.tsx        # Global auth state (Supabase session)
│   ├── data/
│   │   └── hostel.ts              # Static hostel data (blocks, rooms, pricing)
│   ├── lib/
│   │   └── supabase.ts            # Supabase client initialisation
│   ├── pages/
│   │   ├── Overview.tsx           # Public landing page
│   │   ├── Rooms.tsx              # Public rooms listing
│   │   ├── HowToApply.tsx         # Application guide page
│   │   ├── Fees.tsx               # Fee structure page
│   │   ├── Login.tsx              # Login page
│   │   ├── Register.tsx           # Registration page
│   │   ├── Dashboard.tsx          # Admin overview dashboard
│   │   ├── AdminRooms.tsx         # Admin room management
│   │   ├── Guests.tsx             # Admin guest management
│   │   ├── Bookings.tsx           # Admin bookings management
│   │   ├── Payments.tsx           # Admin payments view
│   │   ├── Maintenance.tsx        # Admin maintenance requests
│   │   ├── Reports.tsx            # Admin reports & analytics
│   │   ├── AdminAnnouncements.tsx # Admin announcement management
│   │   ├── StudentDashboardHome.tsx
│   │   ├── ExploreBlocks.tsx      # Student block browsing
│   │   ├── ExploreRooms.tsx       # Student room browsing
│   │   ├── Apply.tsx              # Room application form
│   │   ├── StudentMyRoom.tsx      # Student's assigned room view
│   │   ├── StudentPayments.tsx    # Student payment portal
│   │   └── StudentMaintenance.tsx # Student maintenance requests
│   ├── App.tsx                    # Route definitions
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles + Tailwind directives
├── supabase/
│   └── functions/
│       └── paystack/
│           └── index.ts           # Paystack payment Edge Function (Deno)
├── schema.sql                     # Main database schema (run first)
├── applications_schema.sql        # Applications table schema
├── payments_schema.sql            # Payments table schema
├── maintenance_schema.sql         # Maintenance requests schema
├── announcements_schema.sql       # Announcements table schema
├── .env.example                   # Environment variable template
├── PAYSTACK_SETUP.md              # Paystack integration guide
├── vercel.json                    # Vercel SPA rewrite rules
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **Git** — [git-scm.com](https://git-scm.com/)
- A **Supabase** account — [supabase.com](https://supabase.com/) (free tier works)
- A **Paystack** account (for payment features) — [paystack.com](https://paystack.com/)
- **Supabase CLI** (for deploying Edge Functions) — [Supabase CLI docs](https://supabase.com/docs/guides/cli)

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mayorx7/hostelhub.git
   cd hostelhub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables) below)

---

## Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# Supabase — from: Supabase Dashboard > Project Settings > API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack — from: Paystack Dashboard > Settings > API Keys
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

> [!IMPORTANT]
> **Never commit `.env.local`, `.env`, or any file containing real credentials.** These files are already excluded in `.gitignore`.

### Supabase Edge Function Secrets

The Paystack Edge Function requires additional secrets set via the Supabase CLI (not in `.env.local`):

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See [PAYSTACK_SETUP.md](./PAYSTACK_SETUP.md) for the full Paystack setup walkthrough.

---

## Running Locally

```bash
npm run dev
```

The app will be available at **http://localhost:5173** by default.

---

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## Database Setup

HostelHub uses Supabase (PostgreSQL) as its database. You need to run the SQL schema files in the Supabase SQL Editor in order.

1. Go to your **Supabase Dashboard > SQL Editor**

2. Run the files in this order:

   ```
   1. schema.sql                    ← Core tables (users, rooms, blocks, bookings)
   2. applications_schema.sql       ← Applications table + RLS policies
   3. payments_schema.sql           ← Student payments table + RLS
   4. maintenance_schema.sql        ← Maintenance requests table + RLS
   5. announcements_schema.sql      ← Announcements table + RLS
   ```

3. Optional patch files (run if you encounter specific issues):

   ```
   fix_is_admin.sql
   fix_student_booking_visibility.sql
   add_delete_policy.sql
   paystack_rls_patch.sql
   ```

> [!NOTE]
> All tables use **Row Level Security (RLS)**. The schema files include the necessary RLS policies for both admin and student roles.

---

## Supabase Edge Functions

The Paystack payment integration runs as a Supabase Edge Function (Deno runtime).

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Log in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the Edge Function
supabase functions deploy paystack

# Set required secrets
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_secret_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Deployment

HostelHub is configured for one-click deployment on **Vercel**. The `vercel.json` includes SPA rewrite rules so React Router works correctly on all routes.

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add your environment variables in **Project Settings > Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PAYSTACK_PUBLIC_KEY`
4. Click **Deploy**

Vercel will automatically build with `npm run build` and serve from the `dist/` directory.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development server | `npm run dev` | Start Vite dev server with HMR |
| Production build | `npm run build` | Build optimised production bundle |
| Preview build | `npm run preview` | Serve the production build locally |
| Lint | `npm run lint` | Run ESLint across the codebase |
| Type check | `npm run typecheck` | Run TypeScript compiler checks (no emit) |

---

## Usage

### Default Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page — overview of the hostel |
| `/rooms` | Public | Browse available room types |
| `/fees` | Public | View accommodation fee structure |
| `/how-to-apply` | Public | Step-by-step application guide |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/admin-dashboard` | Admin only | Admin overview dashboard |
| `/admin-dashboard/rooms` | Admin only | Room management |
| `/admin-dashboard/guests` | Admin only | Guest records |
| `/admin-dashboard/bookings` | Admin only | Booking management |
| `/admin-dashboard/payments` | Admin only | Payment records |
| `/admin-dashboard/maintenance` | Admin only | Maintenance requests |
| `/admin-dashboard/reports` | Admin only | Reports & analytics |
| `/admin-dashboard/announcements` | Admin only | Announcements management |
| `/student-dashboard` | Student only | Student home dashboard |
| `/student-dashboard/explore` | Student only | Browse hostel blocks |
| `/student-dashboard/explore/:blockId` | Student only | Browse rooms in a block |
| `/student-dashboard/apply` | Student only | Apply for a room |
| `/student-dashboard/my-room` | Student only | View assigned room |
| `/student-dashboard/payments` | Student only | Make/track payments |
| `/student-dashboard/maintenance` | Student only | Submit maintenance requests |

### Roles

- **Admin**: Full access to the admin dashboard. Assigned in the database via the `profiles` table.
- **Student**: Access to the student portal only. Default role on registration.

---

## Important Notes

- **Room data**: The 4 blocks (Kogi Hall, Confluence Hall, Osara Hall, Okene Hall) and their rooms are defined statically in `src/data/hostel.ts`. Room availability status is managed dynamically via Supabase.
- **Payments**: Paystack test mode is active by default. Use Paystack test cards for testing (see [PAYSTACK_SETUP.md](./PAYSTACK_SETUP.md)).
- **Gender restriction**: Room blocks are gender-restricted (Blocks A & C are male; B & D are female). Students see only rooms matching their registered gender.
- **Debug scripts**: The root-level `test_*.js` and `verify_bookings.js` files are development debugging utilities. They require `.env.local` to be present and are not part of the application runtime.

---

## License

This project is licensed under the **MIT License**.

---

<div align="center">
  Built with ❤️ for university hostel management
</div>
