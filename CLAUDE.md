# DailyDisc Project Overview

DailyDisc is a music discovery platform where users can explore, review, and get AI-powered album recommendations. It features a daily album selection and community-driven reviews.

## Tech Stack

- **Framework**: Remix with Vite (React SSR)
- **Database**: Turso (SQLite cloud) with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **APIs**: Spotify, Apple Music, OpenAI
- **Deployment**: Fly.io with Docker

## Project Structure

```
/app
  /components     # Reusable UI components (shadcn/ui pattern)
  /routes         # Remix file-based routes
  /services       # External APIs and business logic
  /drizzle        # Database schema and migrations
  /contexts       # React contexts (auth)
  /hooks          # Custom React hooks
  /styles         # CSS files
  /util           # Utilities and types
```

## Key Features

1. **Daily Album**: Featured album of the day
2. **User Reviews**: Rate albums with favorite tracks
3. **Archive**: Browse past daily albums
4. **AI Recommendations**: Get album suggestions via OpenAI
5. **Recent Activity**: Community review feed
6. **User Profiles**: View review history
7. **Artist Pages**: Artist info and discography

## Database Schema

- `users` - User accounts
- `albums` - Album metadata
- `artists` - Artist information
- `artists_to_albums` - Many-to-many relationship
- `reviews` - User reviews and ratings
- `sitemaps` - SEO sitemaps

## Development Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm typecheck    # Run TypeScript checks
pnpm lint         # Run ESLint
pnpm test         # Run tests
```

## API Patterns

- Resource routes: `/api.{resource-name}`
- Use loaders for GET, actions for POST
- Consistent error handling with `invariantResponse`
- JSON responses with TypeScript types

## Code Style

- TypeScript strict mode
- Prettier with custom import ordering
- Tailwind CSS with custom theme
- File/folder naming: kebab-case
- Component naming: PascalCase

## Testing

- Vitest with React Testing Library
- Run with: `pnpm test`
- Tests located alongside components

## Environment Variables

Required:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `SESSION_SECRET`

## Common Workflows

### Adding a new route
1. Create file in `/app/routes/`
2. Export loader/action functions as needed
3. Export default component

### Adding a review
1. User navigates to album page
2. Submits review form
3. Review saved to database
4. Appears in recent activity

### Updating database schema
1. Modify schema in `/app/drizzle/schema.ts`
2. Run `pnpm db:migrations`
3. Apply with `pnpm db:push`

## Important Notes

- Always run `pnpm typecheck` and `pnpm lint` before committing
- Follow existing component patterns in `/app/components`
- Use Remix's built-in form handling for mutations
- Leverage server-side rendering for better SEO
- Test on mobile - site is mobile-first