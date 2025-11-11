import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabase'

// POST /api/shares - Create a new share link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { content_id, wallet_address, parent_share_id } = body

    // Validate required fields
    if (!content_id || !wallet_address) {
      return NextResponse.json(
        { error: 'Missing required fields: content_id, wallet_address' },
        { status: 400 }
      )
    }

    // Verify content exists
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id')
      .eq('id', content_id)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Calculate share depth
    let share_depth = 0
    if (parent_share_id) {
      const { data: parentShare } = await supabase
        .from('shares')
        .select('share_depth')
        .eq('id', parent_share_id)
        .single()
      
      share_depth = parentShare ? parentShare.share_depth + 1 : 0
    }

    // Check if user already has a share for this content
    const { data: existingShare } = await supabase
      .from('shares')
      .select('*')
      .eq('content_id', content_id)
      .eq('wallet_address', wallet_address)
      .single()

    if (existingShare) {
      return NextResponse.json(
        { 
          share: existingShare,
          message: 'Share already exists for this wallet'
        },
        { status: 200 }
      )
    }

    // Generate unique share URL
    const shareId = crypto.randomUUID()
    const share_url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareId}`

    // Create share
    const { data: share, error: shareError } = await supabase
      .from('shares')
      .insert({
        id: shareId,
        content_id,
        wallet_address,
        parent_share_id: parent_share_id || null,
        share_depth,
        share_url,
      })
      .select()
      .single()

    if (shareError) {
      console.error('Share creation error:', shareError)
      return NextResponse.json(
        { error: 'Failed to create share', details: shareError.message },
        { status: 500 }
      )
    }

    // Update content total_shares count
    const { data: currentContent } = await supabase
      .from('content')
      .select('total_shares')
      .eq('id', content_id)
      .single()

    if (currentContent) {
      await supabase
        .from('content')
        .update({ total_shares: (currentContent.total_shares || 0) + 1 })
        .eq('id', content_id)
    }

    return NextResponse.json(
      { share },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

