import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// POST /api/revenue - Add revenue to content and distribute to viral chain
export async function POST(request: NextRequest) {
  try {
    const { content_id, amount_lamports } = await request.json();

    if (!content_id || !amount_lamports || amount_lamports <= 0) {
      return NextResponse.json(
        { error: 'content_id and positive amount_lamports required' },
        { status: 400 }
      );
    }

    // Fetch all shares for this content
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select('*')
      .eq('content_id', content_id)
      .order('share_depth', { ascending: true });

    if (sharesError || !shares || shares.length === 0) {
      return NextResponse.json(
        { error: 'No shares found for this content' },
        { status: 404 }
      );
    }

    // Calculate distribution using exponential decay model
    // Creator (depth 0) gets more, each level gets progressively less
    // Weight = 2^(maxDepth - currentDepth)
    const maxDepth = Math.max(...shares.map(s => s.share_depth));
    
    const weights = shares.map(share => {
      return Math.pow(2, maxDepth - share.share_depth);
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Distribute revenue proportionally
    const distributions = shares.map((share, index) => {
      const shareAmount = Math.floor((amount_lamports * weights[index]) / totalWeight);
      return {
        share_id: share.id,
        wallet_address: share.wallet_address,
        amount: shareAmount,
        new_total: share.earnings_lamports + shareAmount,
      };
    });

    // Update each share's earnings
    const updatePromises = distributions.map(dist =>
      supabase
        .from('shares')
        .update({ earnings_lamports: dist.new_total })
        .eq('id', dist.share_id)
    );

    await Promise.all(updatePromises);

    // Update content's total revenue
    const { data: content } = await supabase
      .from('content')
      .select('total_revenue_lamports')
      .eq('id', content_id)
      .single();

    if (content) {
      await supabase
        .from('content')
        .update({ 
          total_revenue_lamports: content.total_revenue_lamports + amount_lamports 
        })
        .eq('id', content_id);
    }

    return NextResponse.json({
      success: true,
      amount_distributed: amount_lamports,
      distributions,
    });
  } catch (error) {
    console.error('Revenue distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to distribute revenue' },
      { status: 500 }
    );
  }
}

