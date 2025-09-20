# 💇‍♀️ COIFFEUR BY RABIA CAYLI 

A modern, responsive salon booking website built with Next.js, featuring appointment scheduling, service management, and admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green?style=flat-square&logo=supabase)

## ✨ Features

- 🏠 **Modern Homepage** - Beautiful landing page with service showcase
- 📅 **Appointment Booking** - Easy-to-use appointment scheduling system
- 👨‍💼 **Admin Dashboard** - Complete management interface for services and appointments
- 📱 **Responsive Design** - Optimized for all devices (mobile, tablet, desktop)
- 🎨 **Dark Theme** - Sleek black and white design
- 🔐 **Secure Authentication** - Protected admin area
- 📞 **Contact Integration** - WhatsApp and Instagram links
- ⚡ **Fast Performance** - Built with Next.js 15 and optimized for speed

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm (recommended package manager)
- Supabase account for database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CoiffeurByRabiaCayli
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env-template.txt .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

4. **Set up the database**
   ```bash
   # Run the database schema in your Supabase SQL editor
   # Copy the contents of database-schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── appointments/       # Appointment management
│   │   ├── categories/         # Service categories
│   │   └── services/           # Service management
│   ├── components/             # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── AdminDashboard.tsx # Admin interface
│   │   ├── AppointmentPage.tsx # Booking page
│   │   └── ...                # Other pages
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── supabase/
│   └── functions/             # Edge functions
├── database-schema.sql        # Database setup
└── edge-functions-schema.sql  # Edge function schema
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🗄️ Database Setup

The project uses Supabase as the backend. Import the database schema from `database-schema.sql` into your Supabase project to set up:

- **Categories** - Service categories
- **Service Groups** - Grouped services
- **Services** - Individual services with pricing
- **Appointments** - Customer bookings
- **Admin Users** - Admin authentication

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI, Lucide React icons
- **Deployment**: Vercel (recommended)

## 📱 Pages

- **Home** - Main landing page with services
- **Appointments** - Booking interface
- **Contact** - Contact information and social links
- **Admin Dashboard** - Service and appointment management
- **Legal Pages** - Impressum, Datenschutz, AGB

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
npm run build
npm run start
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | ✅ |

## 📞 Support

For questions or support, please contact the development team or refer to the documentation.

## 📄 License

This project is private and proprietary to COIFFEUR BY RABIA CAYLI .

---

**Built with ❤️ for COIFFEUR BY RABIA CAYLI **
