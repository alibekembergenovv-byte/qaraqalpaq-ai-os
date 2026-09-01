# Qaraqalpaq AI Content OS

A full-stack, AI-powered content automation platform designed to discover, curate, translate/generate (in Qaraqalpaq), and publish technology news to Telegram.

## Features

- **Automated News Discovery**: Collects RSS feeds from top AI and tech blogs.
- **AI Curation (Gemini 2.5 Flash)**: Scores news for relevance, novelty, and virality.
- **AI Fact-Checking**: Verifies claims and provides confidence scores.
- **Qaraqalpaq Writer (Gemini 2.5 Pro)**: Generates high-quality, natural Qaraqalpaq Telegram posts based on custom brand guidelines and terminology rules.
- **Content Strategist & Scorer**: Determines the best format (e.g., "HOW TO USE") and automatically grades the generated content.
- **Approval Workflow**: Kanban-style dashboard for reviewing, editing, and approving content.
- **Telegram Integration**: Publish directly to channels or receive private approval requests.
- **AI Feedback Loop**: Analyzes post performance to recommend future content strategies.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Generative AI SDK (Gemini)
- **Integrations**: Telegraf (Telegram Bot API), RSS Parser
- **Auth**: NextAuth.js (Auth.js)

## Prerequisites

- Node.js (v18+)
- PostgreSQL database (local or cloud like Supabase)
- Google Gemini API Key
- Telegram Bot Token

## Installation & Setup

1. **Clone the repository and install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your details:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Required variables: `DATABASE_URL`, `AUTH_SECRET`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`.

3. **Database Setup**
   Push the Prisma schema to your database and generate the client:
   \`\`\`bash
   npx prisma db push
   npx prisma generate
   \`\`\`

4. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   Access the dashboard at `http://localhost:3000`.

## Production Deployment

This application is ready to be deployed on Vercel or any Node.js compatible Docker environment. For background cron jobs in production, consider using Vercel Cron or a dedicated worker instead of `node-cron`.

## Security

- API keys and database URLs are stored in environment variables.
- The admin dashboard is protected via session-based authentication (NextAuth).
- Ensure `AUTH_SECRET` is generated securely (`openssl rand -base64 32`).
