import { ethers } from 'ethers';
import HypeChainArtifact from './HypeChain.json';

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(
  process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network'
);

const contractAddress = '0x92F1Cab66699B0f3C00EFE712fec4851BCD7feE6';
const contract = new ethers.Contract(
  contractAddress,
  HypeChainArtifact.abi,
  provider
);

// Event types for TypeScript
export type ContentCreatedEvent = {
  contentId: bigint;
  creator: string;
  contentURI: string;
  timestamp: bigint;
};

export type ShareCreatedEvent = {
  shareId: bigint;
  contentId: bigint;
  sharer: string;
  parentShareId: bigint;
  depth: bigint;
  timestamp: bigint;
};

export type EngagementRecordedEvent = {
  shareId: bigint;
  contentId: bigint;
  user: string;
  engagementType: string;
  timestamp: bigint;
};

// Listen to ContentCreated events
export function subscribeToContentCreated(
  callback: (event: ContentCreatedEvent) => void
) {
  contract.on('ContentCreated', (contentId, creator, contentURI, timestamp, rawEvent) => {
    callback({
      contentId,
      creator,
      contentURI,
      timestamp,
    });
  });

  return () => contract.off('ContentCreated');
}

// Listen to ShareCreated events
export function subscribeToShareCreated(
  callback: (event: ShareCreatedEvent) => void
) {
  contract.on('ShareCreated', (shareId, contentId, sharer, parentShareId, depth, timestamp, rawEvent) => {
    callback({
      shareId,
      contentId,
      sharer,
      parentShareId,
      depth,
      timestamp,
    });
  });

  return () => contract.off('ShareCreated');
}

// Listen to EngagementRecorded events
export function subscribeToEngagementRecorded(
  callback: (event: EngagementRecordedEvent) => void
) {
  contract.on('EngagementRecorded', (shareId, contentId, user, engagementType, timestamp, rawEvent) => {
    callback({
      shareId,
      contentId,
      user,
      engagementType,
      timestamp,
    });
  });

  return () => contract.off('EngagementRecorded');
}

// Subscribe to all events for a specific content ID
export function subscribeToContentEvents(
  contentId: string | number,
  onShare: (event: ShareCreatedEvent) => void,
  onEngagement: (event: EngagementRecordedEvent) => void
) {
  const unsubscribeShare = subscribeToShareCreated((event) => {
    if (event.contentId.toString() === contentId.toString()) {
      onShare(event);
    }
  });

  const unsubscribeEngagement = subscribeToEngagementRecorded((event) => {
    if (event.contentId.toString() === contentId.toString()) {
      onEngagement(event);
    }
  });

  return () => {
    unsubscribeShare();
    unsubscribeEngagement();
  };
}

// Fetch historical events for a content ID
export async function getContentEventHistory(contentId: string | number) {
  // Somnia RPC limits queries to 1000 blocks, so query recent blocks only
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 999); // Last 1000 blocks
  
  const contentCreatedFilter = contract.filters.ContentCreated(contentId);
  const shareCreatedFilter = contract.filters.ShareCreated(null, contentId);
  const engagementFilter = contract.filters.EngagementRecorded(null, contentId);

  const [contentEvents, shareEvents, engagementEvents] = await Promise.all([
    contract.queryFilter(contentCreatedFilter, fromBlock, currentBlock),
    contract.queryFilter(shareCreatedFilter, fromBlock, currentBlock),
    contract.queryFilter(engagementFilter, fromBlock, currentBlock),
  ]);

  return {
    contentCreated: contentEvents.map((e) => {
      const event = e as ethers.EventLog;
      return {
        contentId: event.args[0],
        creator: event.args[1],
        contentURI: event.args[2],
        timestamp: event.args[3],
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    }),
    shares: shareEvents.map((e) => {
      const event = e as ethers.EventLog;
      return {
        shareId: event.args[0],
        contentId: event.args[1],
        sharer: event.args[2],
        parentShareId: event.args[3],
        depth: event.args[4],
        timestamp: event.args[5],
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    }),
    engagements: engagementEvents.map((e) => {
      const event = e as ethers.EventLog;
      return {
        shareId: event.args[0],
        contentId: event.args[1],
        user: event.args[2],
        engagementType: event.args[3],
        timestamp: event.args[4],
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    }),
  };
}

export { contract, provider };

