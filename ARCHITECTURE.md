# HypeChain Architecture

## Overview
HypeChain is a "Proof-of-Hype" viral tracking system built on Somnia testnet. It rewards the entire viral chain of content sharers, not just the original creator.

## Tech Stack
- **Frontend**: Next.js 16.0.1 (React), Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Blockchain**: Solidity smart contracts on Somnia testnet, Hardhat
- **Real-time**: Somnia Data Streams SDK
- **Wallet**: MetaMask/Phantom (WIP)

## Current Structure

```
hype-chain/
├── app/                          # Next.js app directory (frontend + backend)
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout with Navigation
│   ├── globals.css               # Global styles (Tailwind imports)
│   ├── create/page.tsx           # Create content form
│   ├── explore/page.tsx          # Browse all viral content
│   ├── share/[shareId]/page.tsx  # Join viral chain via share link
│   ├── content/[contentId]/      # Content detail + viral tree visualization
│   │   └── page.tsx
│   └── api/                      # Next.js API routes (backend)
│       ├── content/
│       │   ├── route.ts          # POST /api/content, GET /api/content (list)
│       │   └── [id]/route.ts     # GET /api/content/:id (detail + stats)
│       ├── shares/
│       │   ├── route.ts          # POST /api/shares (create share)
│       │   └── [contentId]/tree/route.ts  # GET /api/shares/:contentId/tree
│       ├── share/[shareId]/route.ts  # GET /api/share/:shareId
│       ├── engagements/route.ts  # POST /api/engagements (track views/clicks)
│       └── streams/              # Somnia Data Streams integration
│           ├── events/route.ts   # SSE endpoint for live events
│           └── history/[contentId]/route.ts  # Historical blockchain events
├── src/                          # Source code (organized)
│   ├── components/
│   │   └── Navigation.tsx        # Header navigation component
│   ├── lib/                      # Shared utilities
│   │   ├── supabase.ts           # Supabase client + TypeScript types
│   │   └── dataStreams.ts        # Somnia Data Streams SDK integration
│   ├── database/
│   │   └── schema.sql            # PostgreSQL schema for Supabase
│   ├── scripts/
│   │   └── deploy.ts             # Contract deployment script
│   └── test/
│       └── HypeChain.test.ts     # Smart contract tests (Hardhat)
├── contracts/
│   ├── HypeChain.sol             # Solidity smart contract
│   ├── HypeChain.json            # Contract ABI
│   └── deployed-contract.json    # Deployment info
├── hardhat.config.ts             # Hardhat configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies

```

## Database Schema

### Tables
1. **content** - Original content created by users
   - `id`, `nft_address`, `creator_wallet`, `title`, `media_url`
   - `total_shares`, `total_engagements`, `total_revenue_lamports`
   - `created_at`

2. **shares** - Viral share chain (tree structure)
   - `id`, `content_id`, `wallet_address`, `parent_share_id`
   - `share_depth`, `share_url`, `click_count`, `earnings_lamports`
   - `created_at`

3. **engagements** - User interactions tracking
   - `id`, `share_id`, `engagement_type` (view/click/share)
   - `ip_address`, `user_agent`, `created_at`

4. **payouts** - Revenue distribution log
   - `id`, `content_id`, `wallet_address`, `amount_lamports`
   - `transaction_hash`, `status`, `created_at`

## Smart Contract (HypeChain.sol)

### Key Functions
- `createContent(nftAddress, title, mediaUrl)` - Mint content NFT
- `createShare(contentId, parentShareId)` - Create share in viral chain
- `recordEngagement(shareId, engagementType)` - Track engagement
- `distributeRevenue(contentId)` - Split revenue across viral chain

### Events (for Data Streams)
- `ContentCreated`
- `ShareCreated`
- `EngagementRecorded`
- `RevenueDistributed`

## API Routes

### Content
- `POST /api/content` - Create new content (also creates initial share)
- `GET /api/content?limit=20&offset=0` - List all content with pagination
- `GET /api/content/:id` - Get content details + stats (shares, engagements, top sharers)

### Shares
- `POST /api/shares` - Create a new share link (joins viral chain)
- `GET /api/share/:shareId` - Get single share by ID
- `GET /api/shares/:contentId/tree` - Get viral tree structure (hierarchical)

### Engagements
- `POST /api/engagements` - Record engagement (view/click/share)

### Streams
- `GET /api/streams/events` - SSE endpoint for real-time blockchain events
- `GET /api/streams/history/:contentId` - Historical events for content

## Frontend Pages

### Landing (`/`)
- Hero section with Somnia branding
- "How It Works" explainer
- CTAs: "Explore Viral Chains" and "Create Content"

### Create (`/create`)
- Form: title, media URL, wallet address
- Creates content + initial share link
- Returns shareable URL

### Explore (`/explore`)
- Grid view of all content
- Shows title, media preview, share count, engagements
- Click to view viral tree

### Share (`/share/:shareId`)
- Displays content details
- User enters wallet to get personalized share link
- Records engagement

### Content Detail (`/content/:contentId`)
- Media display (image or title card with dot pattern)
- Stats: total shares, engagements, revenue, max depth
- Creator info
- Share section (copy URL or get personalized link)
- **Viral Share Tree** with animated chains on hover

## Key Features

### Animated Viral Tree
- Hierarchical tree visualization of share chain
- Hover effects: chains grow from parent to child
- 20 chain links (⛓️) for deep connections
- Group hover: parent hover lights up all children

### Real-time Data Streams
- Subscribes to blockchain events via Somnia SDK
- SSE endpoint pushes live updates to frontend
- Historical event querying with 1000-block limit handling

## Separation of Concerns

### Current State (Next.js Monolith)
**Pros:**
- Fast development
- Simplified deployment
- Shared types between frontend/backend

**Cons:**
- Frontend and backend tightly coupled
- No clear API boundaries
- Difficult to scale independently

**Note:** For this hackathon MVP, we're sticking with Next.js API routes (app/api/). A fully separated backend (Express/Fastify) would only be needed for production scaling at a later stage.

## Security

### Current Implementation
- [ ] No authentication (using plain wallet addresses)
- [ ] No input validation
- [ ] No rate limiting
- [!] Environment variables via `.env.local`

### Required for Production
- [ ] JWT/OAuth2 authentication
- [ ] Input validation (Zod/Joi)
- [ ] Rate limiting (Redis)
- [ ] CORS configuration
- [ ] Request logging
- [ ] Error handling middleware
- [ ] TLS/HTTPS enforcement

## Testing

### Current State
- [x] Smart contract tests (Hardhat/Chai)
- [ ] No API route tests
- [ ] No frontend component tests
- [ ] No E2E tests

### Required Coverage
- [ ] API route tests (Jest/Vitest)
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Integration tests (Supabase + blockchain)

## Deployment

### Current Setup
- Development: `npm run dev` (localhost:3000)
- Smart contracts: Deployed to Somnia testnet
- Database: Hosted on Supabase

### Production Requirements
- [ ] Vercel/Netlify deployment
- [ ] Environment variable management
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database migrations
- [ ] Contract verification
- [ ] Monitoring/logging (Sentry, LogRocket)

## Pending Features

### Phase 2 - Core
- [ ] Wallet authentication (MetaMask/Phantom)
- [ ] Revenue distribution + auto-split
- [ ] Delete functionality (with chain breaks)

### Phase 3 - Advanced
- [ ] Profile page (user's shares + earnings)
- [ ] Leaderboard (top earners, most viral)
- [ ] Real-time live feed (uses Data Streams)
- [ ] Share analytics dashboard

### Phase 4 - Launch
- [ ] Comprehensive README
- [ ] Production deployment
- [ ] Demo video (3-5 minutes)

## Technical Debt

1. **Somnia RPC 1000-block limit** - Implemented chunking workaround in `lib/dataStreams.ts`
2. **No caching layer** - Every request hits Supabase directly
3. **No WebSocket alternative** - SSE only (no fallback)
4. **Hardcoded chain heights** - Charlie's chain uses hardcoded 17rem
5. **No database indexes** - May slow down as data grows
6. **Missing foreign key constraints** - Referential integrity not enforced
7. **No transaction handling** - Content + share creation not atomic

## Development Guidelines

### Code Style
- TypeScript strict mode
- Tailwind for styling (no inline styles)
- Conventional commits (`feat:`, `fix:`, `chore:`)
- No emojis in code (only UI)

### Naming Conventions
- Files: kebab-case (`viral-tree.tsx`)
- Components: PascalCase (`Navigation.tsx`)
- Functions: camelCase (`renderTreeNode`)
- Database: snake_case (`share_depth`)

### Git Workflow
- Feature branches: `dev/feature-name`
- Small, focused PRs
- Test locally before pushing
- Squash commits on merge

## Hackathon Priorities (Somnia Data Streams)

### Judging Criteria Focus
1. **Innovation** [x] - Viral attribution is novel
2. **Data Streams Integration** [x] - Live events + historical queries
3. **Market Appeal** [!] - Need better UI polish + demo
4. **Technical Execution** [!] - Working but needs production hardening

### Winning Strategy
- [x] Unique use case (viral attribution)
- [x] Real-time visualization
- [!] Need comprehensive README
- [!] Need polished demo video
- [ ] Missing deployed production app

---

**Last Updated:** 2025-11-11  
**Version:** 0.1.0 (MVP)

