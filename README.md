# HypeChain: Proof-of-Hype Viral Attribution

**Built for the Somnia Data Streams Hackathon**

HypeChain is an on-chain viral tracking system that rewards the entire chain of people who make content go viral, not just the original creator. Every share is tracked, every contributor is rewarded.

## The Problem

Content creators earn revenue when their content goes viral, but the people who actually made it viral (sharers, retweeters, reposters) get nothing. This creates a misaligned incentive structure where viral attribution is lost and middlemen take most of the value.

## My Solution

HypeChain tracks every share in a viral chain using smart contracts and distributes revenue automatically based on contribution. When content goes viral:

1. **Every share is tracked** on-chain with parent-child relationships
2. **Revenue flows through the entire chain** using exponential decay
3. **Earlier sharers earn more** incentivizing early adoption
4. **Full transparency** see exactly who contributed to virality

## Somnia Data Streams Integration

HypeChain leverages **Somnia Data Streams** for real-time viral tracking and analytics

### How I Use Data Streams

**1. Smart Contract Events**
My HypeChain contract emits events for every viral action:
```solidity
event ContentCreated(uint256 indexed contentId, address creator, string contentURI, uint256 timestamp);
event ShareCreated(uint256 indexed shareId, uint256 indexed contentId, address sharer, uint256 parentShareId, uint256 depth, uint256 timestamp);
event EngagementRecorded(uint256 indexed shareId, uint256 indexed contentId, address user, string engagementType, uint256 timestamp);
```

**2. Real-Time Event Subscription**
I subscribe to these events using Somnia's `ethers.js` provider:
```typescript
// src/lib/dataStreams.ts
export function subscribeToShareCreated(callback: (event: ShareCreatedEvent) => void) {
  contract.on('ShareCreated', (shareId, contentId, sharer, parentShareId, depth, timestamp) => {
    callback({ shareId, contentId, sharer, parentShareId, depth, timestamp });
  });
  return () => contract.off('ShareCreated');
}
```

**3. Live Activity Feed**
The explore page features a real-time activity feed powered by Data Streams:
- Shows shares and engagements as they happen
- Auto-refreshes every 5 seconds
- Live timestamp with second-by-second counter
- Proves real-time capabilities to users

**4. Historical Event Querying**
I query past events to build viral attribution trees:
```typescript
export async function getContentEventHistory(contentId: string | number) {
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 999); // Last 1000 blocks
  
  const shareEvents = await contract.queryFilter(
    contract.filters.ShareCreated(null, contentId),
    fromBlock,
    currentBlock
  );
  // Process events to build viral tree...
}
```

### Why Data Streams Matter for HypeChain

- **Real-time viral tracking** see shares propagate instantly
- **Transparent attribution**  every contribution is verifiable on-chain  
- **Fair revenue distribution** automated payouts based on verified shares
- **Analytics dashboard** live metrics powered by event streams

## Key Features

### Viral Attribution Tree
- Visual tree showing how content spread through the network
- Animated chains connecting parent/child shares on hover
- Track depth, clicks, and earnings for each node
- Delete shares while preserving chain structure

### Revenue Distribution
- Exponential decay model rewards earlier sharers
- Creator manually adds revenue (simulating ad revenue, tips, etc.)
- Automatic distribution across entire viral chain
- Remainder goes to original creator

### Delete with Chain Protection
- Soft deletion preserves analytics and tree structure
- Content can only be deleted when ALL shares are deleted
- Protects active sharers who deserve revenue
- Shows deleted nodes with visual indicators

### Wallet Authentication
- Connect with MetaMask/Phantom
- Auto-fill wallet addresses in forms
- Shows personalized actions (delete own shares, add revenue to own content)
- Persistent sessions with localStorage

### Live Activity Feed
- Real-time updates powered by Somnia Data Streams
- Shows recent shares and engagements
- Live timestamp with refresh counter
- Filters deleted content automatically

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Blockchain**: Somnia Testnet, Solidity, Hardhat
- **Data Streams**: Somnia Data Streams SDK, ethers.js v6
- **Testing**: Vitest, Hardhat tests

## Getting Started

### Prerequisites
- Node.js v18+
- MetaMask or Phantom wallet
- Somnia Testnet tokens (from faucet)

### Installation

```bash
# Clone the repo
git clone https://github.com/kadhirash/hype-chain.git
cd hype-chain

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# SOMNIA_RPC_URL=https://dream-rpc.somnia.network
# PRIVATE_KEY=your-wallet-private-key
```

### Database Setup

1. Create a Supabase project
2. Run the SQL schema in `src/database/schema.sql`
3. Run migrations in order:
   - `src/database/migrations/001_add_is_deleted_to_shares.sql`
   - `src/database/migrations/002_add_deletion_tracking.sql`
   - `src/database/migrations/003_add_content_deletion.sql`

### Smart Contract

HypeChain contract is deployed on **Somnia Dream Testnet**:
- **Contract Address**: `0x92F1Cab66699B0f3C00EFE712fec4851BCD7feE6`
- **Network**: Somnia Dream Testnet
- **Chain ID**: 50312

To deploy your own instance:
```bash
# Compile contracts
npx hardhat compile

# Deploy to Somnia Testnet
npx hardhat run src/scripts/deploy.ts --network somnia

# Update contract address in src/lib/dataStreams.ts
```

### Run Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

### Run Tests

```bash
# API tests
npm run test

# Smart contract tests
npx hardhat test
```

## How It Works

1. **Create Content** - Upload your content with title, media URL, and wallet address
2. **Get Share Link** - Receive a personalized share link with your wallet embedded
3. **Viral Tracking** - Each share creates a new node in the viral attribution tree
4. **Engagement Recording** - Views and clicks are tracked in real-time
5. **Revenue Distribution** - Creator adds revenue (lamports), system distributes automatically using exponential decay
6. **Live Analytics** - Watch your viral chain grow with the real-time activity feed powered by Somnia Data Streams

## Future Improvements

- **Privy Integration** - Enhance wallet authentication with email/social login
- **Profile Pages** - Show user's shares, earnings, and viral contributions
- **Leaderboard** - Top earners and most viral content
- **Analytics Dashboard** - Detailed metrics per wallet
- **Mobile App** - React Native app with push notifications
- **Multi-chain** - Expand beyond Somnia to other EVM chains

## Live Demo

**🚀 Live Site:** https://hype-chain.vercel.app/

Try it out:
- Connect your MetaMask/Phantom wallet
- Create viral content and share it
- Watch the real-time activity feed update
- See the animated viral tree in action

## Demo Video

[Coming soon - link to demo video]

## Team

Built by Kadhirash for the Somnia Data Streams Hackathon 2025

## License

MIT
