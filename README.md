# Father's Day Arcade

A mobile-first Father's Day themed arcade website with interactive games, personalized card generation, and premium unlock system.

## Features

- **Interactive Flow**: Theme selection → Envelope animation → Dad questionnaire → Animated card → Premium unlock → Arcade games
- **Card Generation**: Template-based personalized Father's Day cards with SVG avatars
- **4 Arcade Games**: Memory matching, trivia, ball catching, and emoji matching
- **Premium System**: One-time purchase unlock for full game access
- **Direct Access**: Games accessible at `/games` for testing

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Authentication**: Supabase
- **Payment**: Stripe integration ready
- **Database**: PostgreSQL with comprehensive schema

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`
5. Access games directly at `/games` or start full flow at `/`

## Environment Variables

```
DATABASE_URL=your_postgresql_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Project Structure

```
├── client/src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   └── hooks/         # Custom hooks
├── server/            # Express backend
├── shared/            # Shared types and schema
└── GAME_DEVELOPMENT_RECOMMENDATIONS.md
```

## Game Development

Current games are functional prototypes. For professional game quality, see `GAME_DEVELOPMENT_RECOMMENDATIONS.md` for recommended platforms and tools including Unity, Phaser.js, and professional asset creation tools.

## Database Schema

- Users with subscription tracking
- Father cards storage
- Game sessions logging
- Analytics events

## Known Issues

- Games need enhanced animations and physics
- Card generation could benefit from AI integration
- UI polish and professional design needed

See `GAME_DEVELOPMENT_RECOMMENDATIONS.md` for detailed improvement suggestions and professional development platform recommendations.