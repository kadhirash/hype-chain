import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabase'
import { handleApiError } from '@/src/lib/apiErrorHandler'

// GET /api/content/[id] - Get content by ID with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch content
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return handleApiError(error, 'Failed to fetch content')
    }
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Fetch share count
    const { count: shareCount } = await supabase
      .from('shares')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', id)

    // Fetch engagement count
    const { count: engagementCount } = await supabase
      .from('engagements')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', id)

    // Fetch top sharers (by earnings)
    const { data: topSharers } = await supabase
      .from('shares')
      .select('wallet_address, earnings_lamports, click_count')
      .eq('content_id', id)
      .order('earnings_lamports', { ascending: false })
      .limit(10)

    return NextResponse.json({
      content,
      stats: {
        shares: shareCount || 0,
        engagements: engagementCount || 0,
        topSharers: topSharers || [],
      },
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch content details')
  }
}

