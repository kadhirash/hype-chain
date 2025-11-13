import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const walletLower = wallet.toLowerCase();

    // Fetch all shares with content details
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select(`
        id,
        content_id,
        wallet_address,
        share_depth,
        click_count,
        earnings_lamports,
        is_deleted,
        created_at,
        content:content_id (
          id,
          title,
          total_shares,
          total_revenue_lamports
        )
      `)
      .ilike('wallet_address', walletLower)
      .order('created_at', { ascending: false });

    if (sharesError) {
      console.error('Error fetching shares:', sharesError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    // Calculate earnings by content
    const earningsByContent = new Map<string, { contentId: string; title: string; earnings: number; shares: number }>();
    shares?.forEach((share) => {
      if (!share.content) return;
      const key = share.content_id;
      const existing = earningsByContent.get(key);
      if (existing) {
        existing.earnings += share.earnings_lamports || 0;
        existing.shares += 1;
      } else {
        earningsByContent.set(key, {
          contentId: share.content_id,
          title: share.content?.title || 'Unknown',
          earnings: share.earnings_lamports || 0,
          shares: 1,
        });
      }
    });

    const earningsByContentArray = Array.from(earningsByContent.values())
      .sort((a, b) => b.earnings - a.earnings);

    // Calculate performance by depth
    const performanceByDepth = new Map<number, { count: number; totalEarnings: number; totalClicks: number }>();
    shares?.forEach((share) => {
      const depth = share.share_depth;
      const existing = performanceByDepth.get(depth);
      if (existing) {
        existing.count += 1;
        existing.totalEarnings += share.earnings_lamports || 0;
        existing.totalClicks += share.click_count || 0;
      } else {
        performanceByDepth.set(depth, {
          count: 1,
          totalEarnings: share.earnings_lamports || 0,
          totalClicks: share.click_count || 0,
        });
      }
    });

    const performanceByDepthArray = Array.from(performanceByDepth.entries())
      .map(([depth, stats]) => ({
        depth,
        ...stats,
        avgEarnings: stats.count > 0 ? Math.floor(stats.totalEarnings / stats.count) : 0,
        avgClicks: stats.count > 0 ? Math.floor(stats.totalClicks / stats.count) : 0,
      }))
      .sort((a, b) => a.depth - b.depth);

    // Calculate time-based metrics (last 7 days, 30 days, all time)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentShares = shares?.filter((s) => new Date(s.created_at) >= sevenDaysAgo) || [];
    const monthShares = shares?.filter((s) => new Date(s.created_at) >= thirtyDaysAgo) || [];

    const timeBasedMetrics = {
      last7Days: {
        shares: recentShares.length,
        earnings: recentShares.reduce((sum, s) => sum + (s.earnings_lamports || 0), 0),
        clicks: recentShares.reduce((sum, s) => sum + (s.click_count || 0), 0),
      },
      last30Days: {
        shares: monthShares.length,
        earnings: monthShares.reduce((sum, s) => sum + (s.earnings_lamports || 0), 0),
        clicks: monthShares.reduce((sum, s) => sum + (s.click_count || 0), 0),
      },
      allTime: {
        shares: shares?.length || 0,
        earnings: shares?.reduce((sum, s) => sum + (s.earnings_lamports || 0), 0) || 0,
        clicks: shares?.reduce((sum, s) => sum + (s.click_count || 0), 0) || 0,
      },
    };

    // Best performing shares (by earnings)
    const topShares = shares
      ?.filter((s) => !s.is_deleted)
      .sort((a, b) => (b.earnings_lamports || 0) - (a.earnings_lamports || 0))
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        contentTitle: s.content?.title || 'Unknown',
        contentId: s.content_id,
        earnings: s.earnings_lamports || 0,
        clicks: s.click_count || 0,
        depth: s.share_depth,
      }));

    return NextResponse.json({
      wallet,
      earningsByContent: earningsByContentArray,
      performanceByDepth: performanceByDepthArray,
      timeBasedMetrics,
      topShares: topShares || [],
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

