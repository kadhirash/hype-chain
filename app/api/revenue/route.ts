import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { handleApiError } from '@/src/lib/apiErrorHandler';

// POST /api/revenue - Add revenue to content and distribute to viral chain
export async function POST(request: NextRequest) {
  try {
    const { content_id, amount_lamports } = await request.json();

    // Validate content_id
    if (!content_id || typeof content_id !== 'string') {
      return NextResponse.json(
        { error: 'Valid content_id required' },
        { status: 400 }
      );
    }

    // Validate amount_lamports
    const amount = Number(amount_lamports);
    
    // Check for non-numeric, NaN, decimals, negative, or zero
    if (
      typeof amount_lamports !== 'number' ||
      isNaN(amount) ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: 'amount_lamports must be a positive integer (lamports are indivisible)' },
        { status: 400 }
      );
    }

    // Check for values exceeding JavaScript's max safe integer
    if (amount > Number.MAX_SAFE_INTEGER) {
      return NextResponse.json(
        { error: `amount_lamports exceeds maximum safe value (${Number.MAX_SAFE_INTEGER})` },
        { status: 400 }
      );
    }

    // Fetch all shares for this content
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select('*')
      .eq('content_id', content_id)
      .order('share_depth', { ascending: true });

    if (sharesError) {
      return handleApiError(sharesError, 'Failed to fetch shares for revenue distribution');
    }
    
    if (!shares || shares.length === 0) {
      return NextResponse.json(
        { error: 'No shares found for this content. Create shares before distributing revenue.' },
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
      const shareAmount = Math.floor((amount * weights[index]) / totalWeight);
      return {
        share_id: share.id,
        wallet_address: share.wallet_address,
        amount: shareAmount,
        new_total: share.earnings_lamports + shareAmount,
      };
    });

    // Handle rounding errors: give any remainder to the creator (first share, depth 0)
    const distributedTotal = distributions.reduce((sum, d) => sum + d.amount, 0);
    const remainder = amount - distributedTotal;
    if (remainder > 0 && distributions.length > 0) {
      distributions[0].amount += remainder;
      distributions[0].new_total += remainder;
    }

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
          total_revenue_lamports: content.total_revenue_lamports + amount 
        })
        .eq('id', content_id);
    }

    return NextResponse.json({
      success: true,
      amount_distributed: amount,
      distributions,
      remainder_given_to_creator: remainder,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to distribute revenue');
  }
}

