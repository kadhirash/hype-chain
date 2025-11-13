import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabase'
import { handleApiError, validateRequiredFields } from '@/src/lib/apiErrorHandler'

// POST /api/engagements - Track engagement (view, click, share)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { share_id, content_id, engagement_type, wallet_address } = body

    // Validate required fields
    const validation = validateRequiredFields(body, ['share_id', 'content_id', 'engagement_type'])
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Missing required fields: ${validation.missingFields?.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate engagement type
    if (!['view', 'click', 'share'].includes(engagement_type)) {
      return NextResponse.json(
        { error: 'Invalid engagement_type. Must be: view, click, or share' },
        { status: 400 }
      )
    }

    // Verify share exists
    const { data: share, error: shareError } = await supabase
      .from('shares')
      .select('*')
      .eq('id', share_id)
      .single()

    if (shareError) {
      return handleApiError(shareError, 'Failed to verify share exists')
    }
    
    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      )
    }

    // Create engagement record
    const { data: engagement, error: engagementError } = await supabase
      .from('engagements')
      .insert({
        share_id,
        content_id,
        engagement_type,
        wallet_address: wallet_address || null,
      })
      .select()
      .single()

    if (engagementError) {
      return handleApiError(engagementError, 'Failed to record engagement')
    }

    // Update share click_count if it's a click
    if (engagement_type === 'click') {
      await supabase
        .from('shares')
        .update({ click_count: share.click_count + 1 })
        .eq('id', share_id)
    }

    // Update content total_engagements
    const { data: currentContent } = await supabase
      .from('content')
      .select('total_engagements')
      .eq('id', content_id)
      .single()
    
    if (currentContent) {
      await supabase
        .from('content')
        .update({ total_engagements: (currentContent.total_engagements || 0) + 1 })
        .eq('id', content_id)
    }

    return NextResponse.json(
      { 
        engagement,
        message: `${engagement_type} recorded successfully`
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, 'Failed to record engagement')
  }
}

