import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

// GET /api/activity/recent - Get recent shares and engagements for live feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get recent shares (exclude deleted)
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select(`
        id,
        content_id,
        wallet_address,
        share_depth,
        created_at,
        is_deleted,
        content:content_id (
          title,
          media_url,
          is_deleted
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sharesError) {
      console.error('Error fetching shares:', sharesError);
      return NextResponse.json(
        { error: 'Failed to fetch recent activity' },
        { status: 500 }
      );
    }

    // Get recent engagements
    const { data: engagements, error: engagementsError } = await supabase
      .from('engagements')
      .select(`
        id,
        share_id,
        engagement_type,
        created_at,
        shares:share_id (
          content_id,
          wallet_address,
          content:content_id (
            title
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (engagementsError) {
      console.error('Error fetching engagements:', engagementsError);
    }

    // Combine and sort by timestamp (filter out deleted content)
    const activities = [
      ...(shares || [])
        .filter((share: any) => !share.content?.is_deleted)
        .map((share: any) => ({
          type: 'share',
          id: share.id,
          wallet: share.wallet_address,
          contentId: share.content_id,
          contentTitle: share.content?.title || 'Unknown Content',
          depth: share.share_depth,
          timestamp: share.created_at,
        })),
      ...(engagements || []).map((engagement: any) => ({
        type: 'engagement',
        id: engagement.id,
        engagementType: engagement.engagement_type,
        wallet: engagement.shares?.wallet_address || 'Unknown',
        contentId: engagement.shares?.content_id,
        contentTitle: engagement.shares?.content?.title || 'Unknown Content',
        timestamp: engagement.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

