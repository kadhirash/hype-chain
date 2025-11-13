import { Content, Share } from '@/src/lib/supabase';

// API Response Types

export interface ContentStats {
  shares: number;
  engagements: number;
  topSharers: Array<{
    wallet_address: string;
    earnings_lamports: number;
    click_count: number;
  }>;
}

export interface ContentDetailResponse {
  content: Content;
  stats: ContentStats;
}

export interface ContentListResponse {
  content: Array<Content & {
    total_shares: number;
    deleted_shares: number;
  }>;
  count: number;
}

export interface CreateContentResponse {
  content: Content;
  share: Share;
  warning?: string;
  error?: string;
}

export interface ShareResponse {
  share: Share;
  message?: string;
}

export interface ViralTreeNode extends Share {
  children: ViralTreeNode[];
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface ViralTreeResponse {
  contentId: string;
  tree: ViralTreeNode[];
  totalShares: number;
  activeShares: number;
  deletedShares: number;
  maxDepth: number;
  levelStats: Array<{
    level: number;
    shareCount: number;
  }>;
  creatorShare: ViralTreeNode | null;
}

export interface EngagementResponse {
  engagement: {
    id: string;
    share_id: string;
    content_id: string;
    engagement_type: 'view' | 'click' | 'share';
    wallet_address: string | null;
    created_at: string;
  };
  message: string;
}

export interface RevenueDistribution {
  share_id: string;
  wallet_address: string;
  amount: number;
  new_total: number;
}

export interface RevenueResponse {
  success: boolean;
  amount_distributed: number;
  distributions: RevenueDistribution[];
  remainder_given_to_creator: number;
}

export interface ActivityItem {
  type: 'share' | 'engagement';
  id: string;
  wallet: string;
  contentId: string;
  contentTitle: string;
  timestamp: string;
  depth?: number;
  engagementType?: 'view' | 'click' | 'share';
}

export interface ActivityResponse {
  activities: ActivityItem[];
}

