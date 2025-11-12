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

    // Fetch user's shares with content details
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select(`
        id,
        content_id,
        wallet_address,
        parent_share_id,
        share_depth,
        share_url,
        click_count,
        earnings_lamports,
        is_deleted,
        deleted_at,
        created_at,
        content:content_id (
          id,
          title,
          media_url,
          creator_wallet,
          total_shares,
          total_revenue_lamports
        )
      `)
      .ilike('wallet_address', walletLower)
      .order('created_at', { ascending: false });

    if (sharesError) {
      console.error('Error fetching shares:', sharesError);
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
    }

    // Fetch user's created content
    const { data: createdContent, error: contentError } = await supabase
      .from('content')
      .select('*')
      .ilike('creator_wallet', walletLower)
      .order('created_at', { ascending: false });

    if (contentError) {
      console.error('Error fetching content:', contentError);
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    // Calculate totals
    const totalEarnings = shares?.reduce((sum, share) => sum + (share.earnings_lamports || 0), 0) || 0;
    const totalShares = shares?.length || 0;
    const activeShares = shares?.filter(s => !s.is_deleted).length || 0;
    const deletedShares = shares?.filter(s => s.is_deleted).length || 0;
    const totalClicks = shares?.reduce((sum, share) => sum + (share.click_count || 0), 0) || 0;

    // Calculate content created stats
    const contentCreated = createdContent?.length || 0;
    const totalContentRevenue = createdContent?.reduce(
      (sum, content) => sum + (content.total_revenue_lamports || 0),
      0
    ) || 0;

    return NextResponse.json({
      wallet: wallet,
      stats: {
        totalEarnings,
        totalShares,
        activeShares,
        deletedShares,
        totalClicks,
        contentCreated,
        totalContentRevenue,
      },
      shares: shares || [],
      createdContent: createdContent || [],
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

