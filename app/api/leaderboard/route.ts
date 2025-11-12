import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    // Get top earners by summing earnings across all their shares
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select('wallet_address, earnings_lamports')
      .eq('is_deleted', false);

    if (sharesError) {
      console.error('Error fetching shares for leaderboard:', sharesError);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Aggregate earnings by wallet
    const earningsMap = new Map<string, number>();
    shares?.forEach((share) => {
      const wallet = share.wallet_address.toLowerCase();
      const current = earningsMap.get(wallet) || 0;
      earningsMap.set(wallet, current + (share.earnings_lamports || 0));
    });

    // Convert to array and sort
    // Sort by earnings (desc), then by wallet address (asc) for consistent tie-breaking
    const topEarners = Array.from(earningsMap.entries())
      .map(([wallet, earnings]) => ({ wallet, earnings }))
      .filter(entry => entry.earnings > 0) // Only include earners with actual earnings
      .sort((a, b) => {
        if (b.earnings !== a.earnings) {
          return b.earnings - a.earnings; // Primary sort: earnings descending
        }
        return a.wallet.localeCompare(b.wallet); // Tie-breaker: wallet address ascending
      })
      .slice(0, 10);

    // Get most viral content (by total shares)
    // Note: Supabase doesn't support multi-column ordering directly, so we fetch more and sort in JS
    const { data: contentRaw, error: contentError } = await supabase
      .from('content')
      .select('id, title, media_url, creator_wallet, total_shares, total_revenue_lamports, created_at')
      .eq('is_deleted', false)
      .gt('total_shares', 0) // Only include content with actual shares
      .order('total_shares', { ascending: false })
      .limit(50); // Fetch more to handle ties properly

    const content = contentRaw
      ?.sort((a, b) => {
        if (b.total_shares !== a.total_shares) {
          return b.total_shares - a.total_shares; // Primary: shares descending
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Tie-breaker: newer first
      })
      .slice(0, 10);

    if (contentError) {
      console.error('Error fetching viral content:', contentError);
      return NextResponse.json({ error: 'Failed to fetch viral content' }, { status: 500 });
    }

    // Get most revenue-generating content
    const { data: topRevenueRaw, error: revenueError } = await supabase
      .from('content')
      .select('id, title, media_url, creator_wallet, total_shares, total_revenue_lamports, created_at')
      .eq('is_deleted', false)
      .gt('total_revenue_lamports', 0) // Only include content with actual revenue
      .order('total_revenue_lamports', { ascending: false })
      .limit(50); // Fetch more to handle ties properly

    const topRevenue = topRevenueRaw
      ?.sort((a, b) => {
        if (b.total_revenue_lamports !== a.total_revenue_lamports) {
          return b.total_revenue_lamports - a.total_revenue_lamports; // Primary: revenue descending
        }
        return b.total_shares - a.total_shares; // Tie-breaker: more viral content wins
      })
      .slice(0, 10);

    if (revenueError) {
      console.error('Error fetching top revenue content:', revenueError);
      return NextResponse.json({ error: 'Failed to fetch top revenue' }, { status: 500 });
    }

    return NextResponse.json({
      topEarners,
      viralContent: content || [],
      topRevenue: topRevenue || [],
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

