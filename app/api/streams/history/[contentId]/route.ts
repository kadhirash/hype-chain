import { NextRequest, NextResponse } from 'next/server';
import { getContentEventHistory } from '@/lib/dataStreams';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Fetch all historical events for this content
    const history = await getContentEventHistory(contentId);

    return NextResponse.json({
      contentId,
      contentCreated: history.contentCreated,
      shares: history.shares,
      engagements: history.engagements,
      totalShares: history.shares.length,
      totalEngagements: history.engagements.length,
    });
  } catch (error) {
    console.error('Error fetching event history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event history' },
      { status: 500 }
    );
  }
}

